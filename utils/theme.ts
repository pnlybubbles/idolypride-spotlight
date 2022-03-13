import { AbilityType } from './types'

/**
 * https://whimsical.com/vibrant-theme-MNdDBtXkbZpnwzrEip5MbG
 */
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
  buff: { [key in AbilityType]: string }
}

export const theme: Theme = {
  buff: {
    vocal: colors[3],
    dance: colors[0],
    visual: colors[9],
    'critical-rate': colors[10],
    'critical-score': colors[6],
    'a-score': colors[1],
    'sp-score': colors[8],
    'beat-score': colors[4],
    score: colors[5],
    'stamina-recovery': colors[2],
    'stamina-saving': colors[2],
    'stamina-exhaust': colors[7],
    'ct-reduction': normal,
    'buff-amount': normal,
    'buff-span': normal,
    'cmb-continuous': normal,
    'cmb-score': normal,
    'shift-before-sp': normal,
    tension: normal,
    steruss: normal,
    'eye-catch': normal,
    'skill-success': normal,
    unknown: normal,
  },
}
