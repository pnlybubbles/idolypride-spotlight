import { ArrayN, NumberUnion } from '~~/utils'

export type BuffType =
  | 'vocal'
  | 'dance'
  | 'visual'
  | 'critical-rate'
  | 'critical-score'
  | 'ct-reduction'
  | 'score'
  | 'beat-score'
  | 'a-score'
  | 'sp-score'
  | 'cmb-score'
  | 'stamina-recovery'
  | 'stamina-saving'
  | 'stamina-exhaust'
  | 'buff-span'
  | 'buff-amount'
  | 'steruss'
  | 'cmb-continuous'
  | 'unknown'

type BuffTargetRoles = `${'high-' | 'neighbor-' | ''}${'vocal' | 'dance' | 'visual'}`

export type BuffTarget =
  | 'all'
  | 'self'
  | 'center'
  | 'opponent-center'
  | `${1 | 2 | 3}-${'scorer' | 'lowstamina' | BuffTargetRoles}`

export type PassiveBuffTarget = BuffTarget | 'triggered'

export type BuffCondition = {
  type: 'stamina-greater-than' | 'combo'
  amount: number
} | null

type BuffAbility = {
  type: 'buff'
  buff: BuffType
  condition: BuffCondition
  target: BuffTarget
  amount: number
  span: number
}

type ScoreAbility = {
  type: 'score'
  amount: number
}

type Ability = BuffAbility | ScoreAbility

export type AbilityType = Ability['type']

type PassiveAbility = {
  type: 'buff'
  buff: BuffType
  target: PassiveBuffTarget
  amount: number
  span: number
}

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
  label: string
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
  sub: string
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
