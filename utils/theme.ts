import { BuffType } from './types'

export const colors = [
  '#0088ff',
  '#4736ff',
  '#8d00ff',
  '#d900ff',
  '#0ec1af',
  '#008d73',
  '#998257',
  '#c96565',
  '#ef3b27',
  '#ff8023',
  '#ffce39',
] as const

const normal = '#cccccc'

type Theme = {
  buff: { [key in BuffType]: string }
}

export const theme: Theme = {
  buff: {
    vocal: colors[8],
    dance: colors[0],
    visual: colors[9],
    critical: colors[10],
    'critical-score': colors[6],
    'a-score': colors[1],
    'sp-score': colors[3],
    'beat-score': colors[4],
    score: colors[5],
    stamina: colors[2],
    ct: normal,
    'buff-amount': normal,
    'buff-span': normal,
    unknown: normal,
  },
}
