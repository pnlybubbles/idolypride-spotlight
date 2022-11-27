import {
  Ability_Insert_Input,
  GetIdolListQuery,
  GetIdolQuery,
  Idol_Insert_Input,
  Skill_Insert_Input,
} from '~~/generated/graphql'
import { ArrayN, defined, IntLike, isKeyInObject, mapArrayN, omit, safeParseInt, unreachable } from '.'
import {
  AbilityCondition,
  AbilityData,
  AbilityDiv,
  ActionAbilityType,
  BuffAbilityType,
  ActiveBuffTarget,
  BuffTargetWithoutSuffix,
  PassiveOnlyBuffTarget,
  BuffTargetPrefix,
  BuffTargetWithSuffix,
  IdolData,
  PassiveAbilityData,
  SkillData,
  AbilityEnhance,
  AbilityEnhanceType,
  AbilityConditionType,
  SkillTrigger,
  AbilityConditionWithValue,
  AbilityConditionWithoutValue,
  SkillTriggerWithValue,
  SkillTriggerWithoutValue,
} from './types'
import { v4 as uuid } from 'uuid'
import { SKILLS } from './common'

// Deserialize
// デシリアライズはAPIから来た値を型にマッピングする
// 本当に型に整合しているか値のバリデーションを行う必要性がある
// APIから来た値は基本的にstringとして扱い、それを内部的に扱っているリテラル型にバリデーションしつつ変換する
// 変換に失敗した場合はunknownなどの値に適当にフォールバックしてクラッシュさせない
// フォーマッタは`components/idol-form/helper.ts`のものを共有している
// TOOD: フォーマッタの配置の変更

export const deserializeIdolList = (data: GetIdolListQuery): IdolData[] =>
  data.idol.map((v) => ({
    id: v.id as string,
    name: v.name,
    title: v.title,
    role: v.role,
    type: v.type,
    owned:
      v.owned_by.length > 0
        ? {
            // (idol_id, user_id) のペアでユニークだが、permissionで自分のuser_id以外取れないようにしているのでユニーク
            skillLevels: v.owned_by[0]?.skill_levels as ArrayN<number, 3> | null,
          }
        : null,
    userId: v.user_id,
    skills: v.skills.map(deserializeSkill),
  }))

export const deserializeIdol = (data: GetIdolQuery): IdolData | null =>
  data.idol_by_pk
    ? {
        ...data.idol_by_pk,
        owned: null,
        userId: data.idol_by_pk.user_id,
        skills: data.idol_by_pk.skills.map(deserializeSkill),
      }
    : null

type TmpSkill = GetIdolListQuery['idol'][number]['skills'][number]
const deserializeSkill = ({ type, ...rest }: TmpSkill): SkillData => {
  const ability = sortAblities(rest.abilities.map(deserializeAbility))
  return {
    id: rest.id as string,
    name: rest.name,
    index: rest.index as 0 | 1 | 2,
    level: rest.level,
    ...(type === 'sp'
      ? {
          type,
          ability,
        }
      : type === 'a'
      ? {
          type,
          ability,
          ct: rest.ct ?? 0,
        }
      : type === 'p'
      ? {
          type,
          ability,
          ct: rest.ct ?? 0,
          trigger: rest.trigger != null ? formatSkillTrigger(rest.trigger, rest.trigger_value) : { type: 'none' },
        }
      : unreachable(type)),
  }
}

export function formatSkillTrigger(skill: string, value: IntLike): SkillTrigger {
  if (isSkillTriggerWithValue(skill)) {
    return { type: skill, amount: safeParseInt(value) ?? 0 }
  } else if (isSkillTriggerWithoutValue(skill)) {
    return { type: skill }
  }
  return { type: 'unknown' }
}

type TmpAbility = TmpSkill['abilities'][number]
const deserializeAbility = ({ type, ...rest }: TmpAbility): AbilityData => {
  const id = rest.id as string
  // TODO: amountが無い効果もあるので型を適切に分岐する
  const amount = rest.amount ?? 0
  const condition: AbilityCondition =
    rest.condition != null
      ? formatAbilityCondition(rest.condition, rest.condition_value)
      : // TODO: conditionがnullのケースはなくなるはず
        { type: 'none' }
  return type === 'get-score'
    ? {
        div: 'score',
        id,
        amount,
        condition,
        enhance:
          rest.enhance != null
            ? formatAbilityEnhance(rest.enhance, rest.enhance_value)
            : // get-scoreのときにenhanceがnullになるケースはありえない
              { type: 'none' },
      }
    : isBuffAbilityType(type)
    ? {
        div: 'buff',
        id,
        type,
        condition,
        target: (rest.target ?? 'unknown') as ActiveBuffTarget,
        amount,
        span: rest.span ?? 1,
      }
    : isActionAbilityType(type)
    ? {
        div: 'action-buff',
        id,
        type,
        condition,
        target: (rest.target ?? 'unknown') as ActiveBuffTarget,
        amount,
      }
    : // 存在しない場合はbuffのunknownにフォールバック
      {
        div: 'buff',
        id,
        type: 'unknown',
        condition,
        target: (rest.target ?? 'unknown') as ActiveBuffTarget,
        amount,
        span: rest.span ?? 0,
      }
}

export function formatAbilityCondition(condition: string, value: IntLike): AbilityCondition {
  if (isAbilityConditionWithValue(condition)) {
    return { type: condition, amount: safeParseInt(value) ?? 0 }
  } else if (isAbilityConditionWithoutValue(condition)) {
    return { type: condition }
  }
  return { type: 'unknown' }
}

export function formatAbilityEnhance(enhance: string, value: IntLike): AbilityEnhance {
  if (isAbilityEnhanceWithValue(enhance)) {
    return { type: enhance, value: safeParseInt(value) ?? 0 }
  } else if (isAbilityEnhanceWithoutValue(enhance)) {
    return { type: enhance }
  }
  return { type: 'unknown' }
}

// Serialize
// シリアライズは基本的に型整合している検査済みの値をAPIスキーマに合わせてマッピングする
// 型的に値があれば入れるし、なければ入れない
// 特殊な整合性チェックなどは行う必要性がない

type RequiredSerialized<T> = {
  [K in keyof T]-?: NonNullable<T[K]> extends {
    data: unknown[]
    on_conflict?: unknown
  }
    ? {
        data: NonNullable<T[K]>['data'][number][]
        on_conflict?: NonNullable<NonNullable<T[K]>['on_conflict']>
      }
    : T[K]
}

export const serializeIdol = (
  v: IdolData,
  upsert = false
): RequiredSerialized<Omit<Idol_Insert_Input, 'owned_by'>> => ({
  id: upsert && v.id !== '' ? v.id : uuid(),
  name: v.name,
  title: v.title,
  type: v.type,
  role: v.role,
  skills: {
    data: v.skills.map((w) => serializeSkill(w, upsert)),
    ...(upsert
      ? {
          on_conflict: {
            constraint: 'skill_pkey',
            update_columns: ['index', 'name', 'type', 'level', 'trigger', 'trigger_value', 'ct'],
          },
        }
      : null),
  },
})

const serializeSkill = (v: SkillData, upsert: boolean): RequiredSerialized<Omit<Skill_Insert_Input, 'idol'>> => ({
  id: upsert && v.id !== '' ? v.id : uuid(),
  index: v.index,
  name: v.name,
  type: v.type,
  level: v.level,
  trigger: v.type === 'p' ? v.trigger.type : null,
  trigger_value: v.type === 'p' && 'amount' in v.trigger ? v.trigger.amount : null,
  ct: v.type !== 'sp' ? v.ct : null,
  abilities: {
    data: v.ability.map((w) => serializeAbility(w, upsert)),
    ...(upsert
      ? {
          on_conflict: {
            constraint: 'ability_pkey',
            update_columns: [
              'amount',
              'type',
              'span',
              'target',
              'condition',
              'condition_value',
              'enhance',
              'enhance_value',
            ],
          },
        }
      : null),
  },
})

const serializeAbility = (v: PassiveAbilityData, upsert: boolean): RequiredSerialized<Ability_Insert_Input> => ({
  id: upsert && v.id !== '' ? v.id : uuid(),
  amount: v.amount,
  enhance: v.div === 'score' ? v.enhance.type : null,
  enhance_value: v.div === 'score' && 'value' in v.enhance ? v.enhance.value : null,
  type: v.div === 'score' ? 'get-score' : v.type,
  span: v.div === 'buff' ? v.span : null,
  target: v.div !== 'score' ? v.target : null,
  condition: v.condition.type,
  condition_value: 'amount' in v.condition ? v.condition.amount : null,
  skill: null,
})

// 値ありの効果条件
export const ABILITY_CONDITION_WITH_VALUE: Record<AbilityConditionWithValue, string> = {
  combo: 'Xコンボ以上時',
  'combo-less-than': 'Xコンボ以下時',
  'stamina-greater-than': 'スタミナX%以上の時',
  'stamina-less-than': 'スタミナX%以下の時',
  'anyone-stamina-less-than': '誰かのスタミナがX%以下の時',
}
export const isAbilityConditionWithValue = isKeyInObject(ABILITY_CONDITION_WITH_VALUE)

// 値なしの効果条件
export const ABILITY_CONDITION_WITHOUT_VALUE: Record<AbilityConditionWithoutValue, string> = {
  none: 'なし',
  critical: 'クリティカル発動時',
  'vocal-up': '自身がボーカルアップ時',
  'dance-up': '自身がダンスアップ時',
  'visual-up': '自身がビジュアルアップ時',
  'eye-catch': '自身が集目状態の時',
  debuff: '自身が低下効果状態の時',
  'tension-up': '自身がテンションアップ時',
  'critical-up': '自身がクリティカル率アップ時',
  'critical-score-up': '自身がクリティカル係数アップ時',
  'score-up': '自身がスコアアップ時',
  'a-score-up': '自身がAスキルスコアアップ時',
  'sp-score-up': '自身がSPスキルスコアアップ時',
  'beat-score-up': '自身がビートスコアアップ時',
  'cmb-score-up': '自身がコンボスコアアップ時',
  'in-center': '自身がセンター時',
  'in-vocal-lane': '自身がボーカルレーンの時',
  'in-dance-lane': '自身がダンスレーンの時',
  'in-visual-lane': '自身がビジュアルレーンの時',
  'anyone-vocal-up': '誰かがボーカルアップ時',
  'anyone-dance-up': '誰かがダンスアップ時',
  'anyone-visual-up': '誰かがビジュアルアップ時',
  'anyone-eye-catch': '誰かが集目状態の時',
  'anyone-debuff': '誰かが低下効果状態の時',
  'anyone-tension-up': '誰かがテンションアップ時',
  'anyone-critical-up': '誰かがクリティカル率アップ時',
  'anyone-critical-score-up': '誰かがクリティカル係数アップ時',
  'anyone-score-up': '誰かがスコアアップ時',
  'anyone-a-score-up': '誰かがAスキルスコアアップ時',
  'anyone-sp-score-up': '誰かがSPスキルスコアアップ時',
  'anyone-beat-score-up': '誰かがビートスコアアップ時',
  'anyone-cmb-score-up': '誰かがコンボスコアアップ時',
  unknown: '不明',
}
export const isAbilityConditionWithoutValue = isKeyInObject(ABILITY_CONDITION_WITHOUT_VALUE)

// 値ありのスキルトリガ
export const SKILL_TRIGGER_WITH_VALUE: Record<SkillTriggerWithValue, string> = ABILITY_CONDITION_WITH_VALUE
export const isSkillTriggerWithValue = isKeyInObject(SKILL_TRIGGER_WITH_VALUE)

// 値なしのスキルトリガ
export const SKILL_TRIGGER_WITHOUT_VALUE: Record<SkillTriggerWithoutValue, string> = {
  none: '無条件',
  sp: '誰かがSPスキル発動前',
  'self-sp': '自身がSPスキル発動前',
  a: '誰かがAスキル発動前',
  beat: 'ビート時',
  ...omit(ABILITY_CONDITION_WITHOUT_VALUE, ['none', 'in-vocal-lane', 'in-dance-lane', 'in-visual-lane', 'in-center']),
}
export const isSkillTriggerWithoutValue = isKeyInObject(SKILL_TRIGGER_WITHOUT_VALUE)

// 持続効果
export const BUFF_ABILITY_TYPE: Record<BuffAbilityType, string> = {
  vocal: 'ボーカル上昇',
  dance: 'ダンス上昇',
  visual: 'ビジュアル上昇',
  score: 'スコア上昇',
  'a-score': 'Aスキルスコア上昇',
  'sp-score': 'SPスキルスコア上昇',
  'p-score': 'Pスキルスコア上昇',
  'beat-score': 'ビートスコア上昇',
  'cmb-score': 'コンボスコア上昇',
  'cmb-continuous': 'コンボ継続',
  'critical-rate': 'クリティカル率上昇',
  'critical-score': 'クリティカル係数上昇',
  'stamina-exhaust': 'スタミナ消費増加',
  'stamina-saving': 'スタミナ消費低下',
  'stamina-continuous-recovery': 'スタミナ継続回復',
  steruss: 'ステルス',
  tension: 'テンションUP',
  'eye-catch': '集目効果',
  'skill-success': 'スキル成功率上昇',
  'vocal-down': 'ボーカル低下',
  'dance-down': 'ダンス低下',
  'visual-down': 'ビジュアル低下',
  'vocal-boost': 'ボーカルブースト',
  'dance-boost': 'ダンスブースト',
  'visual-boost': 'ビジュアルブースト',
  'debuff-guard': '低下効果防止',
  'a-score-add': 'Aスキルスコア追加',
  'sp-score-add': 'SPスキルスコア付与',
  'p-score-add': 'Pスキルスコア付与',
  slump: '不調',
  unknown: '不明',
}

export const isBuffAbilityType = isKeyInObject(BUFF_ABILITY_TYPE)

// 即時効果
export const ACTION_ABILITY_TYPE: Record<ActionAbilityType, string> = {
  'buff-span': '強化効果延長',
  'buff-amount': '強化効果増強',
  'ct-reduction': 'CT減少',
  'stamina-recovery': 'スタミナ回復',
  'stamina-recovery-percentage': 'スタミナX%回復',
  'stamina-loss': 'スタミナ消費',
  'debuff-recovery': '低下効果回復',
  'debuff-inverse': '低下効果反転',
  'buff-erase': '強化効果消去',
  'vocal-buff-erase': 'ボーカルアップ効果消去',
  'dance-buff-erase': 'ダンスアップ効果消去',
  'visual-buff-erase': 'ビジュアルアップ効果消去',
  'shift-before-sp': '強化効果をSPスキル前に移動',
  'shift-before-a': '強化効果をAスキル前に移動',
  'delegate-buff': '<対象>へ強化効果譲渡',
}
export const isActionAbilityType = isKeyInObject(ACTION_ABILITY_TYPE)

// 効果対象
export const BUFF_TARGET_WITHOUT_SUFFIX: Record<BuffTargetWithoutSuffix | PassiveOnlyBuffTarget, string> = {
  triggered: '発動トリガーの対象',
  self: '自身',
  all: '全員',
  center: 'センター',
  neighbor: '隣接',
  'opponent-center': '相手のセンター [バトルのみ]',
  'opponent-same-lane': '相手の同じレーン [バトルのみ]',
  unknown: '不明',
}
export const isBuffTargetWithoutSuffix = isKeyInObject(BUFF_TARGET_WITHOUT_SUFFIX)

// 効果対象 (X人付き)
export const BUFF_TARGET_WITH_SUFFIX: Record<BuffTargetWithSuffix, string> = {
  scorer: 'スコアラーX人',
  supporter: 'サポーターX人',
  buffer: 'バッファーX人',
  'high-vocal': 'ボーカルが高いX人',
  'high-dance': 'ダンスが高いX人',
  'high-visual': 'ビジュアルが高いX人',
  vocal: 'ボーカルタイプX人',
  dance: 'ダンスタイプX人',
  visual: 'ビジュアルタイプX人',
  'vocal-lane': 'ボーカルレーンX人',
  'dance-lane': 'ダンスレーンX人',
  'visual-lane': 'ビジュアルレーンX人',
  'opponent-scorer': '相手のスコアラーX人 [バトルのみ]',
  lowstamina: 'スタミナが低いX人',
  debuff: '低下効果状態のX人',
  'score-up': 'スコアアップ状態のX人',
}
export const isBuffTargetWithSuffix = isKeyInObject(BUFF_TARGET_WITH_SUFFIX)

export const BUFF_TARGET_PREFIX: Record<BuffTargetPrefix, string> = {
  ...BUFF_TARGET_WITHOUT_SUFFIX,
  ...BUFF_TARGET_WITH_SUFFIX,
}

// 値ありのスコア獲得強化
type AbilityEnhanceWithoutValue = Exclude<AbilityEnhance, { value: unknown } | null>['type']
export const ABILITY_ENHANCE_WITHOUT_VALUE: Record<AbilityEnhanceWithoutValue, string> = {
  none: 'なし',
  buff: '強化効果が多い程上昇',
  combo: 'コンボ数が多い程上昇',
  'stamina-rest': '残スタミナが多い程上昇',
  'stamina-rest-less': '残スタミナが少ない程上昇',
  'stamina-comsumed': '消費したスタミナが多い程上昇',
  'stamina-consumed-on-current': 'このスキルで消費したスタミナが多い程上昇',
  'core-fan': 'コアファン率が多い程上昇',
  'audience-rate-less': '観客数割合が少ない程上昇',
  'skill-activated': '自身の発動したスキル数が多い程上昇',
  vocal: 'ボーカルアップが多い程上昇',
  dance: 'ダンスアップが多い程上昇',
  visual: 'ビジュアルアップが多い程上昇',
  'vocal-boost': 'ボーカルブーストが多い程上昇',
  'dance-boost': 'ダンスブーストが多い程上昇',
  'visual-boost': 'ビジュアルブーストが多い程上昇',
  score: 'スコアアップが多い程上昇',
  'a-score': 'Aスキルスコアアップが多い程上昇',
  'beat-score': 'ビートスコアアップが多い程上昇',
  'cmb-score': 'コンボスコアアップが多い程上昇',
  'critical-rate': 'クリティカル率アップが多い程上昇',
  'critical-score': 'クリティカル係数アップが多い程上昇',
  tension: 'テンションアップが多い程上昇',
  'eye-catch': '集目効果が多い程上昇',
  'skill-success': 'スキル成功率が多い程上昇',
  'stamina-saving': 'スタミナ消費低減が多い程上昇',
  unknown: '不明',
}
const isAbilityEnhanceWithoutValue = isKeyInObject(ABILITY_ENHANCE_WITHOUT_VALUE)

// 値なしのスコア獲得強化
type AbilityEnhanceWithValue = Extract<AbilityEnhance, { value: unknown } | null>['type']
export const ABILITY_ENHANCE_WITH_VALUE: Record<AbilityEnhanceWithValue, string> = {
  'combo-more-than-80': 'コンボ数が80以上の時 倍率がX%に上昇',
  'combo-less-than-80': 'コンボ数が80以下の時 倍率がX%に上昇',
  critical: 'クリティカル発動時 倍率がX%に上昇',
  'in-vocal-lane': '自身がボーカルレーンの時 倍率がX%に上昇',
  'in-dance-lane': '自身がダンスレーンの時 倍率がX%に上昇',
  'in-visual-lane': '自身がビジュアルレーンの時 倍率がX%に上昇',
}
export const isAbilityEnhanceWithValue = isKeyInObject(ABILITY_ENHANCE_WITH_VALUE)

export const ABILITY_ENHANCE: Record<AbilityEnhanceType, string> = {
  ...ABILITY_ENHANCE_WITHOUT_VALUE,
  ...ABILITY_ENHANCE_WITH_VALUE,
}

// ソート
export const sortSkills = (skills: readonly [SkillData, SkillData, SkillData]) =>
  [...skills].sort((a, b) => a.index - b.index) as [SkillData, SkillData, SkillData]

// スコア獲得効果を先頭に
const ABILITY_DIV_ORDERING: { [key in AbilityDiv]: number } = {
  score: 0,
  buff: 1,
  'action-buff': 2,
}

// スコア獲得スキルかつ、条件なしが先頭に来るように
const ABILITY_CONDITION_ORDERING = (condition: AbilityConditionType): number => {
  switch (condition) {
    case 'none':
      return 0
    default:
      return 1
  }
}

const sortAblities = <T extends { div: AbilityDiv; condition: AbilityCondition }>(abilities: T[]) =>
  [...abilities].sort((a, b) => {
    const divOrdering = ABILITY_DIV_ORDERING[a.div] - ABILITY_DIV_ORDERING[b.div]
    if (divOrdering !== 0) {
      return divOrdering
    }
    const conditionOrdering =
      ABILITY_CONDITION_ORDERING(a.condition.type) - ABILITY_CONDITION_ORDERING(b.condition.type)
    return conditionOrdering
  })

export const pickSkillsByLevel = (skills: SkillData[], levels?: ArrayN<number | null, 3>) =>
  mapArrayN(SKILLS, (i) => {
    const filtered = skills.filter((v) => v.index === i)
    const specifiedByLevel = levels && levels[i] !== undefined ? filtered.find((v) => v.level === levels[i]) : undefined
    return defined(specifiedByLevel ?? filtered.sort((a, b) => b.level - a.level)[0], 'skills are insufficient')
  })
