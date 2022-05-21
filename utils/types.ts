import { ArrayN, NumberUnion } from '~~/utils'
import { SKILLS } from './common'

// type
export type BuffAbilityType =
  | IdolType
  | 'critical-rate'
  | 'critical-score'
  | 'score'
  | 'beat-score'
  | 'a-score'
  | 'sp-score'
  | 'p-score'
  | 'cmb-score'
  | 'stamina-saving'
  | 'stamina-exhaust'
  | 'buff-amount'
  | 'steruss'
  | 'cmb-continuous'
  | 'tension'
  | 'eye-catch'
  | 'skill-success'
  | 'slump'
  | 'debuff-guard'
  | 'unknown'
  | `${IdolType}-down`
export type ActionAbilityType =
  | 'buff-span'
  | 'ct-reduction'
  | 'stamina-recovery'
  | 'stamina-recovery-percentage'
  | 'debuff-recovery'
  | 'shift-before-sp'
export type AbilityType = BuffAbilityType | ActionAbilityType

// target
export type BuffTargetWithoutSuffix = 'all' | 'self' | 'center' | 'opponent-center' | `neighbor` | 'unknown'
export type BuffTargetWithSuffix =
  | 'scorer'
  | 'opponent-scorer'
  | 'lowstamina'
  | 'debuff'
  | `${'high-' | ''}${IdolType}`
  | IdolType
export type BuffTargetCount = '1' | '2' | '3'
export type ActiveBuffTarget = BuffTargetWithoutSuffix | `${BuffTargetWithSuffix}-${BuffTargetCount}`
export type PassiveOnlyBuffTarget = 'triggered'
export type PassiveBuffTarget = ActiveBuffTarget | PassiveOnlyBuffTarget
export type BuffTargetPrefix = BuffTargetWithoutSuffix | BuffTargetWithSuffix | PassiveOnlyBuffTarget

// condition
export type AbilityConditionType = AbilityConditionWithValue | AbilityConditionWithoutValue
export type AbilityConditionWithValue = 'stamina-greater-than' | `${IfAnyone}stamina-less-than` | 'combo'
export type AbilityConditionWithoutValue =
  | 'none'
  | 'critical'
  | `${IfAnyone}${IdolType}-up`
  | `in-${IdolType}-lane`
  | `${IfAnyone}debuff`
  | `${IfAnyone}eye-catch`
  | `${IfAnyone}tension-up`
  | `${IfAnyone}critical-up`
  | `${'score' | 'a-score' | 'sp-score' | 'cmb-score' | 'beat-score'}-up`
  | 'unknown'
export type AbilityCondition =
  | {
      type: AbilityConditionWithValue
      amount: number
    }
  | {
      type: AbilityConditionWithoutValue
    }

type IfAnyone = 'anyone-' | ''

export type AbilityEnhance =
  | {
      type:
        | 'none'
        | 'buff'
        | 'combo'
        | 'stamina-rest'
        | 'stamina-rest-less'
        | 'stamina-comsumed'
        | 'core-fan'
        | 'audience-rate-less'
        | 'skill-activated'
        | IdolType
        | 'a-score'
        | 'eye-catch'
        | 'critical-rate'
        | 'stamina-saving'
        | 'unknown'
    }
  | {
      type: 'combo-more-than-80'
      value: number
    }
export type AbilityEnhanceType = AbilityEnhance['type']

// ability
type BuffAbility = {
  div: 'buff'
  id: string
  type: BuffAbilityType
  condition: AbilityCondition
  target: ActiveBuffTarget
  amount: number
  span: number
}

type ScoreAbility = {
  div: 'score'
  id: string
  amount: number
  enhance: AbilityEnhance
  condition: AbilityCondition
}

type ActionBuffAbility = {
  div: 'action-buff'
  id: string
  type: ActionAbilityType
  condition: AbilityCondition
  target: ActiveBuffTarget
  amount: number
}

export type AbilityDiv = AbilityData['div']

export type AbilityData = BuffAbility | ScoreAbility | ActionBuffAbility

export type PassiveAbilityData =
  | (Omit<BuffAbility, 'target'> & {
      target: PassiveBuffTarget
    })
  | ScoreAbility
  | (Omit<ActionBuffAbility, 'target'> & {
      target: PassiveBuffTarget
    })

// skill
export type SkillType = SkillData['type']
export type SkillIndex = typeof SKILLS[number]
export type SkillData = {
  id: string
  name: string
  index: SkillIndex
  level: number
} & (
  | {
      type: 'sp'
      ability: AbilityData[]
    }
  | {
      type: 'a'
      ability: AbilityData[]
      ct: number
    }
  | {
      type: 'p'
      ability: PassiveAbilityData[]
      // ct=0のときはライブ中1回
      ct: number
      trigger: SkillTrigger
    }
)
export type SkillTriggerType = SkillTriggerWithValue | SkillTriggerWithoutValue
export type SkillTriggerWithValue = AbilityConditionWithValue
export type SkillTriggerWithoutValue = 'sp' | 'a' | 'beat' | AbilityConditionWithoutValue
export type SkillTrigger =
  | {
      type: SkillTriggerWithValue
      amount: number
    }
  | {
      type: SkillTriggerWithoutValue
    }

// idol
export type IdolRole = 'scorer' | 'buffer' | 'supporter'
export type IdolType = 'vocal' | 'dance' | 'visual'

export interface IdolData {
  id: string
  userId: string | null
  name: string
  title: string
  role: IdolRole
  type: IdolType
  skills: ArrayN<SkillData, 3>
}

// live
export type Lane = NumberUnion<5>

export interface LiveData {
  readonly id: string
  readonly title: string
  readonly unit: string
  readonly a: ArrayN<readonly number[], 5>
  readonly sp: ArrayN<readonly number[], 5>
  readonly beat: number
}
