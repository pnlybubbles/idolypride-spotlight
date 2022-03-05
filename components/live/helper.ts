import { px } from '~~/utils/common'
import { theme } from '~~/utils/theme'
import { AbilityType } from '~~/utils/types'

const SCALE_FACTOR = 5

export const cssBeat = (beat: number) => px(beat * SCALE_FACTOR)

export const cssBuff = (type: AbilityType) => theme.buff[type]
