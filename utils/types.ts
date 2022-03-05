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
  | 'unknown'
export type ActionAbilityType = 'buff-span' | 'ct-reduction' | 'stamina-recovery'
export type AbilityType = BuffAbilityType | ActionAbilityType

export type BuffTargetNoSuffix = 'all' | 'self' | 'center' | 'opponent-center' | `neighbor`
export type BuffTargetWithSuffix = 'scorer' | 'lowstamina' | `${'high-' | ''}${IdolType}`
export type BuffTargetCount = '1' | '2' | '3'
export type BuffTarget = BuffTargetNoSuffix | `${BuffTargetWithSuffix}-${BuffTargetCount}`
export type PassiveBuffTarget = BuffTarget | 'triggered'

export type AbilityConditionType = 'stamina-greater-than' | 'combo'
export type AbilityCondition = {
  type: AbilityConditionType
  amount: number
} | null

type BuffAbility = {
  div: 'buff'
  type: BuffAbilityType
  condition: AbilityCondition
  target: BuffTarget
  amount: number
  span: number
}

type ScoreAbility = {
  div: 'score'
  amount: number
}

type ActionBuffAbility = {
  div: 'action-buff'
  type: ActionAbilityType
  condition: AbilityCondition
  target: BuffTarget
  amount: number
}

type Ability = BuffAbility | ScoreAbility | ActionBuffAbility

export type AbilityDiv = Ability['div']

type PassiveAbility =
  | (Omit<BuffAbility, 'target'> & {
      target: PassiveBuffTarget
    })
  | ScoreAbility
  | (Omit<ActionBuffAbility, 'target'> & {
      target: PassiveBuffTarget
    })

type SkillTrigger =
  | {
      type: 'idle' | 'critical' | 'sp' | 'a'
    }
  | {
      type: 'combo'
      amount: 50
    }

export type SkillType = SkillData['type']

export type SkillData = {
  name: string
} & (
  | {
      type: 'sp'
      ability: Ability[]
    }
  | {
      type: 'a'
      ability: Ability[]
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
