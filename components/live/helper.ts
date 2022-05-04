import { px } from '~~/utils/common'
import { theme } from '~~/utils/theme'
import { AbilityType } from '~~/utils/types'

export const cssBeat = (beat: number, scaleFactor: number) => px(beat * scaleFactor)

export const cssBuff = (type: AbilityType) => theme.buff[type]
