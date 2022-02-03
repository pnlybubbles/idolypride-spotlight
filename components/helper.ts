import { theme } from '~~/utils/theme'
import { BuffType } from '~~/utils/types'

const SCALE_FACTOR = 5

const px = (value: number) => `${value}px`

export const cssBeat = (beat: number) => px(beat * SCALE_FACTOR)

export const cssBuff = (buff: BuffType) => theme.buff[buff]
