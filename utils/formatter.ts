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
  ActionAbilityType,
  BuffAbilityType,
  BuffTarget,
  IdolData,
  PassiveAbilityData,
  SkillData,
  SkillTrigger,
} from './types'
import { v4 as uuid } from 'uuid'

// Deserialize

export const deserializeIdolList = (data: GetIdolListQuery): IdolData[] =>
  data.idol.map((v) => ({
    ...v,
    skills: mapArrayN(SKILLS, (i) => deserializeSkill(defined(v.skills[i]))),
  }))

export const deserializeIdol = (data: GetIdolQuery): IdolData | null =>
  data.idol_by_pk
    ? {
        ...data.idol_by_pk,
        skills: mapArrayN(SKILLS, (i) => deserializeSkill(defined(data.idol_by_pk?.skills[i]))),
      }
    : null

type TmpSkill = GetIdolListQuery['idol'][number]['skills'][number]
const deserializeSkill = ({ type, ...rest }: TmpSkill): SkillData => {
  const ability = rest.abilities.map(deserializeAbility)
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
          trigger: deserializeTrigger(rest.trigger, rest.trigger_value),
        }
      : unreachable(type)),
  }
}

const deserializeTrigger = (
  trigger: string | undefined | null,
  triggerValue: number | undefined | null
): SkillTrigger => {
  const type = defined(trigger)
  if (isSkillTriggerTypeWithValue(type)) {
    return {
      type,
      amount: triggerValue ?? 0,
    }
  } else if (isSkillTriggerTypeWithoutValue(type)) {
    return { type }
  } else {
    return { type: 'unknown' }
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
      : null
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
  trigger: v.type === 'p' ? v.trigger.type : null,
  trigger_value: v.type === 'p' && 'amount' in v.trigger ? v.trigger.amount : null,
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
  condition_value: v.condition && 'amount' in v.condition ? v.condition.amount : null,
})

// 値ありのスキルのトリガ
type SkillTriggerTypeWithValue = Extract<SkillTrigger, { amount: unknown }>['type']
const SKILL_TRIGGER_TYPE_WITH_VALUE_LIST: Record<SkillTriggerTypeWithValue, true> = {
  'stamina-less-than': true,
  combo: true,
}
export const isSkillTriggerTypeWithValue = (type: string): type is SkillTriggerTypeWithValue =>
  SKILL_TRIGGER_TYPE_WITH_VALUE_LIST[type as SkillTriggerTypeWithValue]

// 値なしのスキルのトリガ
type SkillTriggerTypeWithoutValue = Exclude<SkillTrigger, { amount: unknown }>['type']
const SKILL_TRIGGER_TYPE_WITHOUT_VALUE: Record<SkillTriggerTypeWithoutValue, true> = {
  idle: true,
  critical: true,
  beat: true,
  sp: true,
  a: true,
  'score-up': true,
  'a-score-up': true,
  'sp-score-up': true,
  'beat-score-up': true,
  'cmb-score-up': true,
  unknown: true,
}
export const isSkillTriggerTypeWithoutValue = (type: string): type is SkillTriggerTypeWithoutValue =>
  SKILL_TRIGGER_TYPE_WITHOUT_VALUE[type as SkillTriggerTypeWithoutValue]

// 値ありの効果条件
type AbilityConditionWithValue = Extract<AbilityCondition, { amount: unknown }>['type']
const ABILITY_CONDITION_WITH_VALUE: Record<AbilityConditionWithValue, true> = {
  'stamina-less-than': true,
  'stamina-greater-than': true,
  combo: true,
}
export const isAbilityConditionWithValue = (type: string): type is AbilityConditionWithValue =>
  ABILITY_CONDITION_WITH_VALUE[type as AbilityConditionWithValue]

// 値なしの効果条件
type AbilityConditionWithoutValue = Exclude<AbilityCondition, { amount: unknown } | null>['type']
const ABILITY_CONDITION_WITHOUT_VALUE: Record<AbilityConditionWithoutValue, true> = {
  critical: true,
  'anyone-eye-catch': true,
  'anyone-tension-up': true,
  'vocal-up': true,
  'dance-up': true,
  'visual-up': true,
  'anyone-vocal-up': true,
  'anyone-dance-up': true,
  'anyone-visual-up': true,
  'in-vocal-lane': true,
  'in-dance-lane': true,
  'in-visual-lane': true,
  unknown: true,
}
export const isAbilityConditionWithoutValue = (type: string): type is AbilityConditionWithoutValue =>
  ABILITY_CONDITION_WITHOUT_VALUE[type as AbilityConditionWithoutValue]

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
  unknown: true,
}
export const isBuffAbilityType = (type: string): type is BuffAbilityType => BUFF_ABILITY_TYPE[type as BuffAbilityType]

// 即時効果
const ACTION_ABILITY_TYPE: Record<ActionAbilityType, true> = {
  'buff-span': true,
  'ct-reduction': true,
  'stamina-recovery': true,
  'shift-before-sp': true,
}
export const isActionAbilityType = (type: string): type is ActionAbilityType =>
  ACTION_ABILITY_TYPE[type as ActionAbilityType]
