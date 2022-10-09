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
    'vocal-boost': colors[3],
    'dance-boost': colors[0],
    'visual-boost': colors[9],
    'critical-rate': colors[10],
    'critical-score': colors[6],
    'a-score': colors[1],
    'sp-score': colors[8],
    'p-score': colors[1],
    'beat-score': colors[4],
    score: colors[5],
    'stamina-recovery': colors[7],
    'stamina-continuous-recovery': colors[7],
    'stamina-recovery-percentage': colors[7],
    'stamina-loss': colors[7],
    'stamina-saving': colors[7],
    'stamina-exhaust': colors[7],
    'ct-reduction': normal,
    'buff-amount': normal,
    'buff-span': normal,
    'cmb-continuous': normal,
    'cmb-score': normal,
    'shift-before-sp': normal,
    'shift-before-a': normal,
    tension: colors[8],
    steruss: normal,
    'eye-catch': colors[2],
    'skill-success': normal,
    unknown: normal,
    'vocal-down': normal,
    'dance-down': normal,
    'visual-down': normal,
    'debuff-recovery': normal,
    'debuff-guard': normal,
    'debuff-inverse': normal,
    'buff-erase': normal,
    'vocal-buff-erase': normal,
    'dance-buff-erase': normal,
    'visual-buff-erase': normal,
    slump: normal,
    'a-score-add': colors[1],
    'sp-score-add': colors[8],
    'p-score-add': colors[1],
    'delegate-buff': normal,
  },
}
