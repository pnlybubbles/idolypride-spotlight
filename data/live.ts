import { ArrayN } from '~~/utils'

export interface LiveData {
  readonly id: string
  readonly title: string
  readonly a: ArrayN<readonly number[], 5>
  readonly sp: ArrayN<readonly number[], 5>
  readonly beat: number
}

/**
 * Sunny Peace Harmony
 */
const sunnyPeaceHarmony: LiveData = {
  id: 'sunny-peace-harmony',
  title: 'SUNNY PEACE HARMONY',
  a: [
    [28, 64, 120],
    [24, 128, 167],
    [13, 48, 90, 160],
    [4, 59, 79, 152],
    [32, 105, 142],
  ],
  sp: [[], [99], [63], [], []],
  beat: 167,
} as const

export default [sunnyPeaceHarmony]
