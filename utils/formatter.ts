import { GetIdolListQuery } from '~~/generated/graphql'
import { defined, mapArrayN, unreachable } from '.'
import { SKILLS } from './common'
import {
  AbilityCondition,
  AbilityData,
  ActionAbilityType,
  BuffAbilityType,
  BuffTarget,
  IdolData,
  SkillData,
  SkillTrigger,
} from './types'

export const deserializeIdol = (data: GetIdolListQuery): IdolData[] =>
  data.idol.map((v) => ({
    ...v,
    skills: mapArrayN(SKILLS, (i) => deserializeSkill(defined(v.skills[i]))),
  }))

type TmpSkill = GetIdolListQuery['idol'][number]['skills'][number]
const deserializeSkill = ({ type, ...rest }: TmpSkill): SkillData => {
  const ability = rest.abilities.map(deserializeAbility)
  return {
    id: rest.id as string,
    name: rest.name,
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
          ct: defined(rest.ct),
        }
      : type === 'p'
      ? {
          type,
          ability,
          ct: defined(rest.ct),
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
      amount: defined(triggerValue),
    }
  } else if (isSkillTriggerTypeWithoutValue(type)) {
    return { type }
  } else {
    return unreachable()
  }
}

type TmpAbility = TmpSkill['abilities'][number]
const deserializeAbility = ({ type, ...rest }: TmpAbility): AbilityData => {
  const id = rest.id as string
  const amount = defined(rest.amount)
  const condition =
    rest.condition != null
      ? isAbilityConditionWithValue(rest.condition)
        ? {
            type: rest.condition,
            amount: defined(rest.condition_value),
          }
        : isAbilityConditionWithoutValue(rest.condition)
        ? {
            type: rest.condition,
          }
        : unreachable()
      : null
  return type === 'score'
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
        target: defined(rest.target) as BuffTarget,
        amount,
        span: defined(rest.span),
      }
    : isActionAbilityType(type)
    ? {
        div: 'action-buff',
        id,
        type,
        condition,
        target: defined(rest.target) as BuffTarget,
        amount,
      }
    : unreachable(type as never)
}

export const isSkillTriggerTypeWithValue = (type: string): type is Extract<SkillTrigger, { amount: unknown }>['type'] =>
  ['combo'].includes(type)

type SkillTriggerTypeWithouValue = Exclude<SkillTrigger, { amount: unknown }>['type']
const SkillTriggerTypeWithouValueList: SkillTriggerTypeWithouValue[] = [
  'idle',
  'critical',
  'beat',
  'sp',
  'a',
  'score-up',
  'a-score-up',
  'sp-score-up',
  'beat-score-up',
  'cmb-score-up',
]
export const isSkillTriggerTypeWithoutValue = (
  type: string
): type is Exclude<SkillTrigger, { amount: unknown }>['type'] =>
  SkillTriggerTypeWithouValueList.includes(type as SkillTriggerTypeWithouValue)

export const isAbilityConditionWithValue = (
  type: string
): type is Extract<AbilityCondition, { amount: unknown }>['type'] => ['stamina-greater-than', 'combo'].includes(type)

export const isAbilityConditionWithoutValue = (
  type: string
): type is Exclude<AbilityCondition, { amount: unknown } | null>['type'] =>
  [
    'critical',
    'anyone-eye-catch',
    'anyone-tension-up',
    'vocal-up',
    'dance-up',
    'visual-up',
    'anyone-vocal-up',
    'anyone-dance-up',
    'anyone-visual-up',
    'in-vocal-lane',
    'in-dance-lane',
    'in-visual-lane',
  ].includes(type)

export const isBuffAbilityType = (type: string): type is BuffAbilityType =>
  [
    'vocal',
    'dance',
    'visual',
    'critical-rate',
    'critical-score',
    'score',
    'beat-score',
    'a-score',
    'sp-score',
    'cmb-score',
    'stamina-saving',
    'stamina-exhaust',
    'buff-amount',
    'steruss',
    'cmb-continuous',
    'tension',
    'unknown',
  ].includes(type)

export const isActionAbilityType = (type: string): type is ActionAbilityType =>
  ['buff-span', 'ct-reduction', 'stamina-recovery', 'shift-before-sp'].includes(type)
