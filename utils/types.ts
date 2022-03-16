import { ArrayN, NumberUnion } from '~~/utils'
import { SKILLS } from './common'

// type
export type BuffAbilityType =
  | 'vocal'
  | 'dance'
  | 'visual'
  | 'critical-rate'
  | 'critical-score'
  | 'score'
  | 'beat-score'
  | 'a-score'
  | 'sp-score'
  | 'cmb-score'
  | 'stamina-saving'
  | 'stamina-exhaust'
  | 'buff-amount'
  | 'steruss'
  | 'cmb-continuous'
  | 'tension'
  | 'eye-catch'
  | 'skill-success'
  | 'unknown'
export type ActionAbilityType = 'buff-span' | 'ct-reduction' | 'stamina-recovery' | 'shift-before-sp'
export type AbilityType = BuffAbilityType | ActionAbilityType

// target
export type BuffTargetNoSuffix = 'all' | 'self' | 'center' | 'opponent-center' | `neighbor` | 'unknown'
export type BuffTargetWithSuffix = 'scorer' | 'lowstamina' | `${'high-' | ''}${IdolType}`
export type BuffTargetCount = '1' | '2' | '3'
export type BuffTarget = BuffTargetNoSuffix | `${BuffTargetWithSuffix}-${BuffTargetCount}`
type BuffTargetPassiveOnly = 'triggered'
export type PassiveBuffTarget = BuffTarget | BuffTargetPassiveOnly
export type BuffTargetWithoutSuffix = BuffTargetNoSuffix | BuffTargetWithSuffix | BuffTargetPassiveOnly

// condition
export type AbilityConditionType = Exclude<AbilityCondition, null>['type']
export type AbilityCondition =
  | {
      type: 'stamina-greater-than' | 'stamina-less-than' | 'combo'
      amount: number
    }
  | {
      type:
        | 'unknown'
        | 'critical'
        | 'anyone-eye-catch'
        | 'tension-up'
        | `${IdolType}-up`
        | `anyone-${IdolType}-up`
        | `in-${IdolType}-lane`
    }
  | null

// ability
type BuffAbility = {
  div: 'buff'
  id: string
  type: BuffAbilityType
  condition: AbilityCondition
  target: BuffTarget
  amount: number
  span: number
}

type ScoreAbility = {
  div: 'score'
  id: string
  amount: number
  condition: AbilityCondition
}

type ActionBuffAbility = {
  div: 'action-buff'
  id: string
  type: ActionAbilityType
  condition: AbilityCondition
  target: BuffTarget
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

// trigger
type SkillTriggerScoreUp = `${'score' | 'beat-score' | 'a-score' | 'sp-score' | 'cmb-score'}-up`
export type SkillTrigger =
  | {
      type: 'unknown' | 'idle' | 'critical' | 'sp' | 'a' | 'beat' | 'anyone-tension-up' | SkillTriggerScoreUp
    }
  | {
      type: 'combo' | 'stamina-less-than'
      amount: number
    }
export type SkillTriggerType = SkillTrigger['type']

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
      ct: number
      trigger: SkillTrigger
    }
)

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
