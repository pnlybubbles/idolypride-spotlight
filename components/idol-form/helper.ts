import {
  AbilityDiv,
  ActionAbilityType,
  AbilityConditionType,
  IdolRole,
  IdolType,
  SkillType,
  BuffAbilityType,
  BuffTargetCount,
  SkillTriggerType,
  BuffTargetWithoutSuffix,
  SkillIndex,
  IdolData,
  SkillData,
  AbilityData,
  AbilityCondition,
  PassiveAbilityData,
  SkillTrigger,
  BuffTargetWithSuffix,
  PassiveBuffTarget,
} from '~~/utils/types'
import { defined, mapArrayN, strictParseInt, unreachable } from '~~/utils'
import {
  isAbilityConditionWithValue,
  isActionAbilityType,
  isBuffAbilityType,
  isSkillTriggerTypeWithoutValue,
  isSkillTriggerTypeWithValue,
} from '~~/utils/formatter'

export interface AbilityInput {
  id: string
  div: AbilityDiv
  type: BuffAbilityType | ActionAbilityType | null
  condition: AbilityConditionType | 'none'
  conditionValue: string
  target: BuffTargetWithoutSuffix | null
  targetSuffix: BuffTargetCount
  amount: string
  span: string
  noSpan: boolean
}

export interface SkillInput {
  id: string
  index: SkillIndex
  name: string
  level: number
  type: SkillType
  trigger: SkillTriggerType
  triggerValue: string
  ct: string
  once: boolean
  ability: AbilityInput[]
}

export interface IdolInput {
  id: string
  name: string
  title: string
  type: IdolType
  role: IdolRole
  skills: [SkillInput, SkillInput, SkillInput]
}

export const defaultIdolInput = (): IdolInput => ({
  id: '',
  name: '',
  title: '',
  type: 'vocal',
  role: 'scorer',
  skills: [
    {
      id: '',
      index: 0,
      name: '',
      level: 1,
      type: 'sp',
      trigger: 'idle',
      triggerValue: '',
      ct: '',
      once: false,
      ability: [],
    },
    {
      id: '',
      index: 1,
      name: '',
      level: 1,
      type: 'a',
      trigger: 'idle',
      triggerValue: '',
      ct: '',
      once: false,
      ability: [],
    },
    {
      id: '',
      index: 2,
      name: '',
      level: 1,
      type: 'p',
      trigger: 'idle',
      triggerValue: '',
      ct: '',
      once: true,
      ability: [],
    },
  ],
})

export const defaultAbilityInput = (): AbilityInput => ({
  id: '',
  div: 'buff',
  type: null,
  condition: 'none',
  conditionValue: '',
  target: null,
  targetSuffix: '1',
  amount: '',
  span: '',
  noSpan: false,
})

export const formatIdol = (v: IdolInput): IdolData => {
  return {
    ...v,
    skills: mapArrayN(v.skills, formatSkill),
  }
}

const formatSkill = (v: SkillInput): SkillData => {
  const common = {
    id: v.id,
    name: v.name,
    index: v.index,
    level: v.level,
  }
  if (v.type === 'p') {
    const trigger: SkillTrigger = isSkillTriggerTypeWithValue(v.trigger)
      ? {
          type: v.trigger,
          amount: strictParseInt(v.triggerValue),
        }
      : isSkillTriggerTypeWithoutValue(v.trigger)
      ? {
          type: v.trigger,
        }
      : unreachable(v.trigger)
    return {
      type: 'p',
      trigger,
      ability: v.ability.map(formatPassiveAbility),
      ct: v.once ? 0 : strictParseInt(v.ct),
      ...common,
    }
  }
  const ability = v.ability.map(formatAbility)
  if (v.type === 'a') {
    return {
      type: 'a',
      ability,
      ct: v.once ? 0 : strictParseInt(v.ct),
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
  const amount = deriveDisabledAmount(v.type) ? 0 : parseInt(v.amount, 10)
  const condition: AbilityCondition =
    v.condition === 'none'
      ? null
      : isAbilityConditionWithValue(v.condition)
      ? {
          type: v.condition,
          amount: parseInt(v.conditionValue, 10),
        }
      : {
          type: v.condition,
        }
  if (v.div === 'score') {
    return { id, div: 'score', amount, condition }
  }
  const type = defined(v.type, 'type must not be null with action-buff')
  const targetWithoutSuffix = defined(v.target, 'target must not be null with action-buff')
  const target = isBuffTargetSuffixRequired(targetWithoutSuffix)
    ? (`${targetWithoutSuffix}-${v.targetSuffix}` as const)
    : targetWithoutSuffix
  if (v.div === 'action-buff') {
    if (!isActionAbilityType(type)) {
      throw new Error(`div is "action-buff", type "${type}" is invalid`)
    }
    return { div: 'action-buff', id, type, target, amount, condition }
  }
  // SP発動前などのケースで[持続ビート数]が書いてない場合、1ビートとして扱う
  const span = v.noSpan ? 1 : parseInt(v.span, 10)
  if (v.div === 'buff') {
    if (!isBuffAbilityType(type)) {
      throw new Error(`div is "buff", type "${type}" is invalid`)
    }
    return { div: 'buff', id, type, target, amount, condition, span }
  }
  return unreachable(v.div)
}

export const deformatIdol = (v: IdolData): IdolInput => ({
  ...v,
  skills: [...mapArrayN(v.skills, deformatSkill)],
})

const deformatSkill = (w: SkillData, i: SkillIndex): SkillInput => ({
  ...w,
  ct: 'ct' in w ? w.ct.toString() : defaultIdolInput().skills[i].ct,
  once: 'ct' in w ? w.ct === 0 : defaultIdolInput().skills[i].once,
  trigger: 'trigger' in w ? w.trigger.type : defaultIdolInput().skills[i].trigger,
  triggerValue:
    'trigger' in w && 'amount' in w.trigger ? w.trigger.amount.toString() : defaultIdolInput().skills[i].triggerValue,
  ability: w.ability.map(deformatAbility),
})

const deformatAbility = (v: AbilityData | PassiveAbilityData): AbilityInput => {
  const noSpan = 'span' in v ? v.span === 1 : defaultAbilityInput().noSpan
  return {
    id: v.id,
    div: v.div,
    amount: v.amount.toString(),
    span: 'span' in v && !noSpan ? v.span.toString() : defaultAbilityInput().span,
    type: 'type' in v ? v.type : defaultAbilityInput().type,
    condition: v.condition?.type ?? defaultAbilityInput().condition,
    conditionValue:
      v.condition && 'amount' in v.condition ? v.condition.amount.toString() : defaultAbilityInput().conditionValue,
    noSpan,
    ...('target' in v
      ? extractBuffTarget(v.target)
      : {
          target: defaultAbilityInput().target,
          targetSuffix: defaultAbilityInput().targetSuffix,
        }),
  }
}

export const extractBuffTarget = (
  t: PassiveBuffTarget
): { target: BuffTargetWithoutSuffix; targetSuffix: BuffTargetCount } => {
  const matched = t.match(/^(?<target>.+)\-(?<suffix>1|2|3)$/)?.groups
  const target = matched?.target as BuffTargetWithoutSuffix | undefined
  const suffix = matched?.suffix as BuffTargetCount | undefined
  return {
    target: target ?? 'unknown',
    targetSuffix: suffix ?? '1',
  }
}

export const isBuffTargetSuffixRequired = (t: BuffTargetWithoutSuffix): t is BuffTargetWithSuffix =>
  t === 'high-vocal' ||
  t === 'high-dance' ||
  t === 'high-visual' ||
  t === 'vocal' ||
  t === 'dance' ||
  t === 'visual' ||
  t === 'scorer' ||
  t === 'lowstamina'
    ? true
    : t === 'all' ||
      t === 'self' ||
      t === 'center' ||
      t === 'neighbor' ||
      t === 'opponent-center' ||
      t === 'triggered' ||
      t === 'unknown'
    ? false
    : unreachable(t)

export const deriveDisabledAmount = (type: BuffAbilityType | ActionAbilityType | null): boolean =>
  type === 'cmb-continuous'
