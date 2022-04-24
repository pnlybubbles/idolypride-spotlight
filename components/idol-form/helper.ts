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
  BuffTargetWithSuffix,
  PassiveBuffTarget,
  AbilityType,
  AbilityEnhanceType,
} from '~~/utils/types'
import { defined, lift, mapArrayN, safeParseInt, unreachable } from '~~/utils'
import {
  formatAbilityCondition,
  formatAbilityEnhance,
  isActionAbilityType,
  isBuffAbilityType,
} from '~~/utils/formatter'

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
  level: number
  type: SkillType
  ct: string
  once: boolean
  ability: AbilityInput[]
}

export interface IdolInput {
  id: string
  name: string | null
  title: string
  type: IdolType
  role: IdolRole
  skills: [SkillInput, SkillInput, SkillInput]
}

export const defaultIdolInput = (): IdolInput => ({
  id: '',
  name: null,
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
      ct: '',
      once: false,
      ability: [],
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

export const formatIdol = (v: IdolInput): IdolData => {
  return {
    ...v,
    name: defined(v.name),
    userId: null,
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
    return {
      type: 'p',
      ability: v.ability.map((w) => formatPassiveAbility(w, v)),
      ct: v.once ? 0 : safeParseInt(v.ct),
      ...common,
    }
  }
  const ability = v.ability.map((w) => formatAbility(w, v))
  if (v.type === 'a') {
    return {
      type: 'a',
      ability,
      ct: v.once ? 0 : safeParseInt(v.ct),
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

const formatAbility = (v: AbilityInput, s: SkillInput): AbilityData => {
  const ability = formatPassiveAbility(v, s)
  if (ability.div === 'action-buff' || ability.div === 'buff') {
    const target = ability.target
    if (target === 'triggered') {
      throw new Error(`skill type is not "p", target "${target}" is invalid`)
    }
    return { ...ability, target }
  }
  return ability
}

export const formatPassiveAbility = (v: AbilityInput, s: SkillInput): PassiveAbilityData => {
  const id = v.id
  const amount = lift(deriveDisabledAmount)(v.type) ?? false ? 0 : parseInt(v.amount, 10)
  const condition: AbilityCondition = disableCondition(s.type, v.div)
    ? { type: 'none' }
    : formatAbilityCondition(v.condition, v.conditionValue)
  if (v.div === 'score') {
    const enhance = formatAbilityEnhance(v.enhance, 0)
    return { id, div: 'score', amount, enhance, condition }
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
  const span = lift(disableSpan)(v.type) ?? false ? 1 : parseInt(v.span, 10)
  if (v.div === 'buff') {
    if (!isBuffAbilityType(type)) {
      throw new Error(`div is "buff", type "${type}" is invalid`)
    }
    return { div: 'buff', id, type, target, amount, condition, span }
  }
  return unreachable(v.div)
}

/**
 * 入力状態保持用のステート型に変換する
 */
export const deformatIdol = (v: IdolData): IdolInput => ({
  ...v,
  skills: [...mapArrayN(v.skills, deformatSkill)],
})

const deformatSkill = (w: SkillData, i: SkillIndex): SkillInput => {
  const def = defaultIdolInput()
  return {
    ...w,
    ct: 'ct' in w ? w.ct.toString() : def.skills[i].ct,
    once: 'ct' in w ? w.ct === 0 : def.skills[i].once,
    ability: w.ability.map(deformatAbility),
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

export const isBuffTargetSuffixRequired = (t: BuffTargetPrefix): t is BuffTargetWithSuffix =>
  t === 'high-vocal' ||
  t === 'high-dance' ||
  t === 'high-visual' ||
  t === 'vocal' ||
  t === 'dance' ||
  t === 'visual' ||
  t === 'scorer' ||
  t === 'opponent-scorer' ||
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

/**
 * X段階などの明示的なスキルの強度が指定できないもの
 */
const ABILITY_TYPE_DISABLED_AMOUNT: Record<AbilityType, boolean> = {
  'cmb-continuous': true,
  'debuff-recovery': true,
  'shift-before-sp': true,
  slump: true,
  'down-guard': true,
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
  'skill-success': false,
  'sp-score': false,
  'stamina-exhaust': false,
  'stamina-recovery': false,
  'stamina-saving': false,
  'visual-down': false,
  'vocal-down': false,
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
 * SP,Aのスコア獲得スキルの場合は発動条件は存在しない
 */
export const disableCondition = (type: SkillType, div: AbilityDiv) => (type === 'sp' || type === 'a') && div === 'score'
