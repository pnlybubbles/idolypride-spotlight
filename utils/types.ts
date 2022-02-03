import { ArrayN, NumberUnion } from '~~/utils'

export type BuffType =
  | 'vocal'
  | 'dance'
  | 'visual'
  | 'critical'
  | 'critical-score'
  | 'ct'
  | 'score'
  | 'beat-score'
  | 'a-score'
  | 'sp-score'
  | 'stamina'
  | 'buff-span'
  | 'buff-amount'
  | 'unknown'

export type BuffTarget = 'all' | 'self' | '1-scorer' | '2-scorers'

export type PassiveBuffTarget = BuffTarget | 'triggered'

type Ability = {
  type: 'buff'
  buff: BuffType
  target: BuffTarget
  amount: number
  span: number
}

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

export interface IdolData {
  name: string
  sub: string
  role: 'scorer' | 'buffer' | 'supporter'
  type: 'vocal' | 'dance' | 'visual'
  skills: ArrayN<SkillData, 3>
}

export type Lane = NumberUnion<5>

export interface LiveData {
  readonly id: string
  readonly title: string
  readonly a: ArrayN<readonly number[], 5>
  readonly sp: ArrayN<readonly number[], 5>
  readonly beat: number
}
