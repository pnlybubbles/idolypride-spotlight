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
  | 'steruss'
  | 'cmb-continuous'
  | 'tension'
  | 'eye-catch'
  | 'skill-success'
  | 'slump'
  | 'debuff-guard'
  | 'unknown'
  | `${IdolType}-down`
  | `${IdolType}-boost`
export type ActionAbilityType =
  | 'buff-span'
  | 'buff-amount'
  | 'ct-reduction'
  | 'stamina-recovery'
  | 'stamina-recovery-percentage'
  | 'stamina-loss'
  | 'debuff-recovery'
  | 'debuff-inverse'
  | 'buff-erase'
  | 'shift-before-sp'
  | 'shift-before-a'
export type AbilityType = BuffAbilityType | ActionAbilityType

// target
export type BuffTargetWithoutSuffix =
  | 'all'
  | 'self'
  | 'center'
  | 'opponent-center'
  | 'opponent-same-lane'
  | `neighbor`
  | 'unknown'
export type BuffTargetWithSuffix =
  | 'scorer'
  | 'opponent-scorer'
  | 'lowstamina'
  | 'debuff'
  | 'score-up'
  | `high-${IdolType}`
  | `${IdolType}-lane`
  | IdolType
export type BuffTargetCount = '1' | '2' | '3'
export type ActiveBuffTarget = BuffTargetWithoutSuffix | `${BuffTargetWithSuffix}-${BuffTargetCount}`
export type PassiveOnlyBuffTarget = 'triggered'
export type PassiveBuffTarget = ActiveBuffTarget | PassiveOnlyBuffTarget
export type BuffTargetPrefix = BuffTargetWithoutSuffix | BuffTargetWithSuffix | PassiveOnlyBuffTarget

// condition
export type AbilityConditionType = AbilityConditionWithValue | AbilityConditionWithoutValue
export type AbilityConditionWithValue =
  | 'stamina-greater-than'
  | `${IfAnyone}stamina-less-than`
  | 'combo'
  | 'combo-less-than'
export type AbilityConditionWithoutValue =
  | 'none'
  | 'critical'
  | `${IfAnyone}${IdolType}-up`
  | `in-${IdolType}-lane`
  | 'in-center'
  | `${IfAnyone}debuff`
  | `${IfAnyone}eye-catch`
  | `${IfAnyone}tension-up`
  | `${IfAnyone}critical-up`
  | `${IfAnyone}${'score' | 'a-score' | 'sp-score' | 'cmb-score' | 'beat-score'}-up`
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
        | 'stamina-consumed-on-current'
        | 'core-fan'
        | 'audience-rate-less'
        | 'skill-activated'
        | IdolType
        | 'critical-rate'
        | 'critical-score'
        | 'score'
        | 'beat-score'
        | 'a-score'
        | 'cmb-score'
        | 'stamina-saving'
        | 'tension'
        | 'eye-catch'
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
export type SkillTriggerWithoutValue =
  | 'sp'
  | 'self-sp'
  | 'a'
  | 'beat'
  | Exclude<AbilityConditionWithoutValue, `in-${IdolType}-lane` | 'in-center'>
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
  // nullの場合は新規
  userId: string | null
  name: string
  title: string
  role: IdolRole
  type: IdolType
  skills: ArrayN<SkillData, 3>
  // nullの場合は未取得or新規
  owned: boolean | null
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
