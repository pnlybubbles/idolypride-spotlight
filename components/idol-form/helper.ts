import {
  AbilityDiv,
  AbilityConditionType,
  IdolRole,
  IdolType,
  SkillType,
  BuffTargetCount,
  BuffTargetPrefix,
  SkillIndex,
  IdolData,
  SkillData,
  AbilityData,
  AbilityCondition,
  PassiveAbilityData,
  PassiveBuffTarget,
  AbilityType,
  AbilityEnhanceType,
  SkillTriggerType,
} from '~~/utils/types'
import { defined, lift, mapArrayN, safeParseInt, unreachable } from '~~/utils'
import {
  formatAbilityCondition,
  formatAbilityEnhance,
  formatSkillTrigger,
  isActionAbilityType,
  isBuffAbilityType,
  isBuffTargetWithSuffix,
} from '~~/utils/formatter'
import { SKILLS } from '~~/utils/common'
import isNonNullable from 'is-non-nullable'

export interface AbilityInput {
  id: string
  div: AbilityDiv
  /**
   * divによっては使わないのでnullになる
   *
   * TODO: データ的には別々に持ったほうがUIが壊れにくそう
   */
  type: AbilityType | null
  condition: AbilityConditionType
  conditionValue: string
  target: BuffTargetPrefix | null
  targetSuffix: BuffTargetCount
  amount: string
  enhance: AbilityEnhanceType
  enhanceValue: string
  span: string
}

export interface SkillInput {
  id: string
  index: SkillIndex
  name: string
  level: number | null
  type: SkillType
  ct: string
  once: boolean
  ability: AbilityInput[]
  trigger: SkillTriggerType
  triggerValue: string
}

export interface IdolInput {
  id: string | null
  name: string | null
  title: string
  type: IdolType
  role: IdolRole
  skills: [SkillInput, SkillInput, SkillInput]
}

export const defaultIdolInput = (): IdolInput => ({
  id: null,
  name: null,
  title: '',
  type: 'vocal',
  role: 'scorer',
  skills: [
    {
      id: '',
      index: 0,
      name: '',
      level: null,
      type: 'sp',
      ct: '',
      once: false,
      ability: [],
      trigger: 'none',
      triggerValue: '',
    },
    {
      id: '',
      index: 1,
      name: '',
      level: null,
      type: 'a',
      ct: '',
      once: false,
      ability: [],
      trigger: 'none',
      triggerValue: '',
    },
    {
      id: '',
      index: 2,
      name: '',
      level: null,
      type: 'p',
      ct: '',
      once: false,
      ability: [],
      trigger: 'none',
      triggerValue: '',
    },
  ],
})

export const defaultAbilityInput = (
  override: {
    div?: 'score' | 'buff' | undefined
    condition?: AbilityConditionType | undefined
    conditionValue?: string | undefined
  } = {}
): AbilityInput => {
  const { div = 'buff', condition = 'none', conditionValue = '' } = override
  return {
    id: '',
    div: div,
    type: null,
    condition: condition,
    conditionValue: conditionValue,
    target: null,
    targetSuffix: '1',
    amount: '',
    enhance: 'none',
    enhanceValue: '',
    span: '',
  }
}

// Format
// フォーマットはユーザーの入力した値を内部で扱っている型にバリデーションしつつ変換する
// 基本的に入力UIでバリデーションが行われているはずなので、変換できる前提
// 変換に失敗した場合はUIの構造がおかしいのでエラーにする
// UI上に表示されていないが編集用に管理しているステートをフォーマットしないようにする
// バリデーションに利用する関数はUIの表示制御に用いているものを共有する
// Deserializeの処理とかなり近いが、型が編集用内部ステートを対象にしている点と、変換に失敗しない前提という点が大きく異る

/**
 * フォームの制約を遵守してデータの整形を行う
 *
 * フォームが表示されてなかったとしても入力データは保持されているので、制御されていない値はnullなどの適切な値に上書きする必要がある。
 * 一部の値のフォーマットには、デシリアライズ時と同じ関数を再利用する (utils/formatter)
 */
export const formatIdol = (input: IdolInput, baseIdol: IdolData | undefined): IdolData => {
  return {
    ...input,
    id: input.id ?? '', // nullの場合は空文字にする
    name: defined(input.name),
    userId: null,
    skills: [
      ...(baseIdol?.skills.filter((base) => !input.skills.map((v) => v.id).includes(base.id)) ?? []),
      ...input.skills.map((v) => formatSkill(v)).filter(isNonNullable),
    ],
    owned: null,
  }
}

const formatSkill = (v: SkillInput): SkillData | null => {
  if (v.level === null) {
    return null
  }
  const common = {
    id: v.id,
    name: v.name,
    index: v.index,
    level: v.level,
  }
  if (v.type === 'p') {
    return {
      type: 'p',
      ability: v.ability.map((w) => formatPassiveAbility(w)),
      ct: availableSkillOnce(v.type) && v.once ? 0 : safeParseInt(v.ct),
      trigger: formatSkillTrigger(v.trigger, v.triggerValue),
      ...common,
    }
  }
  const ability = v.ability.map((w) => formatAbility(w))
  if (v.type === 'a') {
    return {
      type: 'a',
      ability,
      ct: availableSkillOnce(v.type) && v.once ? 0 : safeParseInt(v.ct),
      ...common,
    }
  }
  if (v.type === 'sp') {
    return {
      type: 'sp',
      ability,
      ...common,
    }
  }
  return unreachable(v.type)
}

const formatAbility = (v: AbilityInput): AbilityData => {
  const ability = formatPassiveAbility(v)
  if (ability.div === 'action-buff' || ability.div === 'buff') {
    const target = ability.target
    if (target === 'triggered') {
      throw new Error(`skill type is not "p", target "${target}" is invalid`)
    }
    return { ...ability, target }
  }
  return ability
}

export const formatPassiveAbility = (v: AbilityInput): PassiveAbilityData => {
  const id = v.id
  // 段階など変数が存在しない効果の場合は0で埋めておく
  const amount = lift(deriveDisabledAmount)(v.type) ?? false ? 0 : safeParseInt(v.amount)
  // 以下の特殊な条件があるが、入力制限を行うと複雑化するため制限していない
  // - A,SPの場合はスコア獲得スキルが必ず1つ以上は発動しなくてはいけない
  // - Pの場合は発動トリガーの条件をクリアした場合には必ず1つ以上の効果が発動しなくてはいけない
  const condition: AbilityCondition = formatAbilityCondition(v.condition, v.conditionValue)
  if (v.div === 'score') {
    const enhance = formatAbilityEnhance(v.enhance, 0)
    return { id, div: 'score', amount, enhance, condition }
  }
  const type = defined(v.type, 'type must not be null with action-buff')
  const targetWithoutSuffix = defined(v.target, 'target must not be null with action-buff')
  const target = isBuffTargetWithSuffix(targetWithoutSuffix)
    ? (`${targetWithoutSuffix}-${v.targetSuffix}` as const)
    : targetWithoutSuffix
  if (v.div === 'action-buff') {
    if (!isActionAbilityType(type)) {
      throw new Error(`div is "action-buff", type "${type}" is invalid`)
    }
    return { div: 'action-buff', id, type, target, amount, condition }
  }
  // SP発動前などのケースで[持続ビート数]が書いてない場合、1ビートとして扱う
  const span = lift(disableSpan)(v.type) ?? false ? 1 : safeParseInt(v.span)
  if (v.div === 'buff') {
    if (!isBuffAbilityType(type)) {
      throw new Error(`div is "buff", type "${type}" is invalid`)
    }
    return { div: 'buff', id, type, target, amount, condition, span }
  }
  return unreachable(v.div)
}

// Deformat
// デフォーマットは内部で扱っている型を編集用のステートに変換する
// 値域のほうが広いため、存在するデータをとりあえずマッピングすれば問題ない
// 逆に値域のほうが広いゆえに、ステートに編集用の初期値を埋め込む必要がある

/**
 * 入力状態保持用のステート型に変換する
 */
export const deformatIdol = (v: IdolData): IdolInput => ({
  ...v,
  // TODO: 指定したスキルレベルをデフォルトでパースするようにしてもよさそう
  skills: mapArrayN(SKILLS, (i) => defaultIdolInput().skills[i]),
})

export const deformatSkill = (w: SkillData, i: SkillIndex): SkillInput => {
  const def = defaultIdolInput()
  return {
    ...w,
    ct: 'ct' in w ? w.ct.toString() : def.skills[i].ct,
    once: 'ct' in w ? w.ct === 0 : def.skills[i].once,
    ability: w.ability.map(deformatAbility),
    trigger: 'trigger' in w ? w.trigger.type : def.skills[i].trigger,
    triggerValue: 'trigger' in w && 'amount' in w.trigger ? w.trigger.amount.toString() : def.skills[i].triggerValue,
  }
}

const deformatAbility = (v: AbilityData | PassiveAbilityData): AbilityInput => {
  const def = defaultAbilityInput()
  return {
    id: v.id,
    div: v.div,
    amount: v.amount.toString(),
    enhance: 'enhance' in v ? v.enhance.type : def.enhance,
    enhanceValue: 'enhance' in v && 'value' in v.enhance ? v.enhance.value.toString() : def.enhanceValue,
    span: 'span' in v ? v.span.toString() : def.span,
    type: 'type' in v ? v.type : def.type,
    condition: v.condition?.type ?? def.condition,
    conditionValue: 'amount' in v.condition ? v.condition.amount.toString() : def.conditionValue,
    ...('target' in v
      ? extractBuffTarget(v.target)
      : {
          target: def.target,
          targetSuffix: def.targetSuffix,
        }),
  }
}

export const extractBuffTarget = (
  t: PassiveBuffTarget
): { target: BuffTargetPrefix; targetSuffix: BuffTargetCount } => {
  const matched = t.match(/^(?<target>.+)-(?<suffix>1|2|3)$/)?.groups
  if (matched === undefined) {
    return {
      target: t as BuffTargetPrefix,
      targetSuffix: '1',
    }
  }
  const target = matched?.target as BuffTargetPrefix | undefined
  const suffix = matched?.suffix as BuffTargetCount | undefined
  return {
    target: target ?? 'unknown',
    targetSuffix: suffix ?? '1',
  }
}

/**
 * X段階, X% などの明示的なスキルの強度が指定できないもの
 */
const ABILITY_TYPE_DISABLED_AMOUNT: Record<AbilityType, boolean> = {
  'cmb-continuous': true,
  'debuff-recovery': true,
  'debuff-inverse': true,
  'buff-erase': true,
  'shift-before-sp': true,
  'shift-before-a': true,
  slump: true,
  'debuff-guard': true,
  'a-score': false,
  'beat-score': false,
  'buff-amount': false,
  'buff-span': false,
  'cmb-score': false,
  'critical-rate': false,
  'critical-score': false,
  'ct-reduction': false,
  'dance-down': false,
  'eye-catch': false,
  'p-score': false,
  'skill-success': false,
  'sp-score': false,
  'stamina-exhaust': false,
  'stamina-loss': false,
  'stamina-recovery': false,
  'stamina-recovery-percentage': false,
  'stamina-saving': false,
  'visual-down': false,
  'vocal-down': false,
  'vocal-boost': false,
  'dance-boost': false,
  'visual-boost': false,
  dance: false,
  score: false,
  steruss: false,
  tension: false,
  unknown: false,
  visual: false,
  vocal: false,
}
export const deriveDisabledAmount = (type: AbilityType): boolean => ABILITY_TYPE_DISABLED_AMOUNT[type]

/**
 * SPスキルスコア上昇の場合は、持続ビートは存在しない (便宜的にspan=1にする)
 */
export const disableSpan = (t: AbilityType) => t === 'sp-score'

/**
 * Pスキルにしかライブ中1回のCT表示は存在しない
 */
export const availableSkillOnce = (t: SkillType) => t === 'p'
