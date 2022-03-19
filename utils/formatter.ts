import {
  Ability_Insert_Input,
  GetIdolListQuery,
  GetIdolQuery,
  Idol_Insert_Input,
  Skill_Insert_Input,
} from '~~/generated/graphql'
import { defined, mapArrayN, unreachable } from '.'
import { SKILLS } from './common'
import {
  AbilityCondition,
  AbilityData,
  AbilityDiv,
  ActionAbilityType,
  BuffAbilityType,
  BuffTarget,
  IdolData,
  PassiveAbilityData,
  SkillData,
} from './types'
import { v4 as uuid } from 'uuid'

// Deserialize

export const deserializeIdolList = (data: GetIdolListQuery): IdolData[] =>
  data.idol.map((v) => ({
    ...v,
    userId: v.user_id,
    skills: mapArrayN(SKILLS, (i) => deserializeSkill(defined(v.skills[i]))),
  }))

export const deserializeIdol = (data: GetIdolQuery): IdolData | null =>
  data.idol_by_pk
    ? {
        ...data.idol_by_pk,
        userId: data.idol_by_pk.user_id,
        skills: sortSkills(mapArrayN(SKILLS, (i) => deserializeSkill(defined(data.idol_by_pk?.skills[i])))),
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
        }
      : unreachable(type)),
  }
}

type TmpAbility = TmpSkill['abilities'][number]
const deserializeAbility = ({ type, ...rest }: TmpAbility): AbilityData => {
  const id = rest.id as string
  const amount = defined(rest.amount)
  const condition: AbilityCondition =
    rest.condition != null
      ? isAbilityConditionWithValue(rest.condition)
        ? {
            type: rest.condition,
            amount: rest.condition_value ?? 0,
          }
        : isAbilityConditionWithoutValue(rest.condition)
        ? {
            type: rest.condition,
          }
        : { type: 'unknown' }
      : // TODO: conditionがnullのケースはなくなるはず
        { type: 'none' }
  return type === 'get-score'
    ? {
        div: 'score',
        id,
        amount,
        condition,
      }
    : isBuffAbilityType(type)
    ? {
        div: 'buff',
        id,
        type,
        condition,
        target: (rest.target ?? 'unknown') as BuffTarget,
        amount,
        span: rest.span ?? 0,
      }
    : isActionAbilityType(type)
    ? {
        div: 'action-buff',
        id,
        type,
        condition,
        target: (rest.target ?? 'unknown') as BuffTarget,
        amount,
      }
    : // 存在しない場合はbuffのunknownにフォールバック
      {
        div: 'buff',
        id,
        type: 'unknown',
        condition,
        target: (rest.target ?? 'unknown') as BuffTarget,
        amount,
        span: rest.span ?? 0,
      }
}

// Serialize

type RequiredSerialized<T> = {
  [K in keyof T]-?: NonNullable<T[K]> extends {
    data: unknown[]
    on_conflict?: unknown
  }
    ? {
        data: RequiredSerialized<NonNullable<T[K]>['data'][number]>[]
        on_conflict?: NonNullable<NonNullable<T[K]>['on_conflict']>
      }
    : T[K]
}

export const serializeIdol = (v: IdolData, upsert = false): RequiredSerialized<Idol_Insert_Input> => ({
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

const serializeSkill = (v: SkillData, upsert: boolean): RequiredSerialized<Skill_Insert_Input> => ({
  id: upsert && v.id !== '' ? v.id : uuid(),
  index: v.index,
  name: v.name,
  type: v.type,
  level: v.level,
  // TODO: 消す
  trigger: null,
  trigger_value: null,
  ct: v.type !== 'sp' ? v.ct : null,
  abilities: {
    data: v.ability.map((w) => serializeAbility(w, upsert)),
    ...(upsert
      ? {
          on_conflict: {
            constraint: 'ability_pkey',
            update_columns: ['amount', 'type', 'span', 'type', 'condition', 'condition_value'],
          },
        }
      : null),
  },
})

const serializeAbility = (v: PassiveAbilityData, upsert: boolean): RequiredSerialized<Ability_Insert_Input> => ({
  id: upsert && v.id !== '' ? v.id : uuid(),
  amount: v.amount,
  type: v.div === 'score' ? 'get-score' : v.type,
  span: v.div === 'buff' ? v.span : null,
  target: v.div !== 'score' ? v.target : null,
  condition: v.condition?.type ?? null,
  condition_value: 'amount' in v.condition ? v.condition.amount : null,
})

// 値ありの効果条件
type AbilityConditionWithValue = Extract<AbilityCondition, { amount: unknown }>['type']
export const ABILITY_CONDITION_WITH_VALUE: Record<AbilityConditionWithValue, string> = {
  combo: 'Xコンボ以上時',
  'stamina-greater-than': 'スタミナX%以上の時',
  'stamina-less-than': 'スタミナX%以下の時',
  'anyone-stamina-less-than': '誰かのスタミナがX%以下の時',
}
export const isAbilityConditionWithValue = (type: string): type is AbilityConditionWithValue =>
  !!ABILITY_CONDITION_WITH_VALUE[type as AbilityConditionWithValue]

// 値なしの効果条件
type AbilityConditionWithoutValue = Exclude<AbilityCondition, { amount: unknown } | null>['type']
export const ABILITY_CONDITION_WITHOUT_VALUE: Record<AbilityConditionWithoutValue, string> = {
  none: 'なし',
  sp: '誰かがSPスキル発動前',
  a: '誰かがAスキル発動前',
  beat: 'ビート時',
  critical: 'クリティカル発動時',
  'vocal-up': '自身がボーカルアップ時',
  'dance-up': '自身がダンスアップ時',
  'visual-up': '自身がビジュアルアップ時',
  'eye-catch': '自身が集目状態の時',
  'tension-up': '自身がテンションアップ状態の時',
  'critical-up': '自身がクリティカル率アップ状態の時',
  'score-up': '自身がスコアアップ時',
  'a-score-up': '自身がAスキルスコアアップ時',
  'sp-score-up': '自身がSPスキルスコアアップ時',
  'beat-score-up': '自身がビートスコアアップ時',
  'cmb-score-up': '自身がコンボスコアアップ時',
  'in-vocal-lane': '自身がボーカルレーンの時',
  'in-dance-lane': '自身がダンスレーンの時',
  'in-visual-lane': '自身がビジュアルレーンの時',
  'anyone-vocal-up': '誰かがボーカルアップ時',
  'anyone-dance-up': '誰かがダンスアップ時',
  'anyone-visual-up': '誰かがビジュアルアップ時',
  'anyone-eye-catch': '誰かが集目状態の時',
  'anyone-tension-up': '誰かがテンションアップ状態の時',
  'anyone-critical-up': '誰かがクリティカル率アップ状態の時',
  unknown: '不明',
}
export const isAbilityConditionWithoutValue = (type: string): type is AbilityConditionWithoutValue =>
  !!ABILITY_CONDITION_WITHOUT_VALUE[type as AbilityConditionWithoutValue]

// 持続効果
const BUFF_ABILITY_TYPE: Record<BuffAbilityType, true> = {
  vocal: true,
  dance: true,
  visual: true,
  'critical-rate': true,
  'critical-score': true,
  score: true,
  'beat-score': true,
  'a-score': true,
  'sp-score': true,
  'cmb-score': true,
  'stamina-saving': true,
  'stamina-exhaust': true,
  'buff-amount': true,
  steruss: true,
  'cmb-continuous': true,
  tension: true,
  'eye-catch': true,
  'skill-success': true,
  unknown: true,
}
export const isBuffAbilityType = (type: string): type is BuffAbilityType => BUFF_ABILITY_TYPE[type as BuffAbilityType]

// 即時効果
const ACTION_ABILITY_TYPE: Record<ActionAbilityType, true> = {
  'buff-span': true,
  'ct-reduction': true,
  'stamina-recovery': true,
  'debuff-recovery': true,
  'shift-before-sp': true,
}
export const isActionAbilityType = (type: string): type is ActionAbilityType =>
  ACTION_ABILITY_TYPE[type as ActionAbilityType]

// ソート
export const sortSkills = (skills: readonly [SkillData, SkillData, SkillData]) =>
  [...skills].sort((a, b) => a.index - b.index) as [SkillData, SkillData, SkillData]

const ABILITY_ORDERING: { [key in AbilityDiv]: number } = {
  score: 0,
  buff: 1,
  'action-buff': 2,
}

const sortAblities = <T extends { div: AbilityDiv }>(abilities: T[]) =>
  [...abilities].sort((a, b) => ABILITY_ORDERING[a.div] - ABILITY_ORDERING[b.div])
