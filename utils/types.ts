import { ArrayN, NumberUnion } from '~~/utils'

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
  | 'unknown'
export type ActionAbilityType = 'buff-span' | 'ct-reduction' | 'stamina-recovery' | 'shift-before-sp'
export type AbilityType = BuffAbilityType | ActionAbilityType

export type BuffTargetNoSuffix = 'all' | 'self' | 'center' | 'opponent-center' | `neighbor`
export type BuffTargetWithSuffix = 'scorer' | 'lowstamina' | `${'high-' | ''}${IdolType}`
export type BuffTargetCount = '1' | '2' | '3'
export type BuffTarget = BuffTargetNoSuffix | `${BuffTargetWithSuffix}-${BuffTargetCount}`
type BuffTargetPassiveOnly = 'triggered'
export type PassiveBuffTarget = BuffTarget | BuffTargetPassiveOnly
export type BuffTargetWithoutSuffix = BuffTargetNoSuffix | BuffTargetWithSuffix | BuffTargetPassiveOnly

export type AbilityConditionType = Exclude<AbilityCondition, null>['type']
export type AbilityCondition =
  | {
      type: 'stamina-greater-than' | 'combo'
      amount: number
    }
  | {
      type: 'critical' | 'anyone-eye-catch' | 'anyone-tension-up' | `${IdolType}-up` | `anyone-${IdolType}-up`
    }
  | null

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

export type AbilityData = BuffAbility | ScoreAbility | ActionBuffAbility

export type AbilityDiv = AbilityData['div']

type PassiveAbility =
  | (Omit<BuffAbility, 'target'> & {
      target: PassiveBuffTarget
    })
  | ScoreAbility
  | (Omit<ActionBuffAbility, 'target'> & {
      target: PassiveBuffTarget
    })

export type SkillTrigger =
  | {
      type: 'idle' | 'critical' | 'sp' | 'a'
    }
  | {
      type: 'combo'
      amount: number
    }

export type SkillTriggerType = SkillTrigger['type']

export type SkillType = SkillData['type']

export type SkillData = {
  id: string
  name: string
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
      ability: PassiveAbility[]
      ct: number
      trigger: SkillTrigger
    }
)

export type IdolRole = 'scorer' | 'buffer' | 'supporter'
export type IdolType = 'vocal' | 'dance' | 'visual'

export interface IdolData {
  id: string
  name: string
  title: string
  role: IdolRole
  type: IdolType
  skills: ArrayN<SkillData, 3>
}

export type Lane = NumberUnion<5>

export interface LiveData {
  readonly id: string
  readonly title: string
  readonly unit: string
  readonly a: ArrayN<readonly number[], 5>
  readonly sp: ArrayN<readonly number[], 5>
  readonly beat: number
}
