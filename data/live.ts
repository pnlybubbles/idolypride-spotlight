import { LiveData } from '~/utils/types'

/**
 * Sunny Peace Harmony
 */
export const SUNNY_PEACE_HARMONY: LiveData = {
  id: 'sunny-peace-harmony',
  title: 'SUNNY PEACE HARMONY',
  unit: 'サニーピース',
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

export default [SUNNY_PEACE_HARMONY]
