export interface LiveData {
  id: string
  title: string
  a: number[][]
  sp: number[][]
  beat: number
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
}

export default [sunnyPeaceHarmony]
