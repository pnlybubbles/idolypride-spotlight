import { extractBuffTarget } from '~~/components/idol-form/helper'
import {
  ABILITY_CONDITION_WITHOUT_VALUE,
  ABILITY_CONDITION_WITH_VALUE,
  ABILITY_ENHANCE_WITHOUT_VALUE,
  ABILITY_ENHANCE_WITH_VALUE,
  ACTION_ABILITY_TYPE,
  BUFF_ABILITY_TYPE,
  BUFF_TARGET_WITHOUT_SUFFIX,
  BUFF_TARGET_WITH_SUFFIX,
  isBuffTargetWithoutSuffix,
} from '~~/utils/formatter'
import { AbilityCondition, AbilityEnhance, ActionAbilityType, BuffAbilityType, PassiveBuffTarget } from '~~/utils/types'

export const LANES = [0, 1, 2, 3, 4] as const
export const SKILLS = [0, 1, 2] as const

export const px = (value: number) => `${value}px`

export const arrayToOrdering = <T>(array: T[]) => {
  const map = array.reduce((acc, v, i) => acc.set(v, i), new Map<T, number>())
  return (key: T) => map.get(key) ?? 9999
}

/**
 * アイドルの名前
 */
export const IDOL_NAME = [
  '長瀬琴乃',
  '伊吹渚',
  '白石沙季',
  '成宮すず',
  '早坂芽衣',
  '川咲さくら',
  '兵藤雫',
  '白石千紗',
  '一ノ瀬怜',
  '佐伯遙子',
  '天動瑠依',
  '鈴村優',
  '奥山すみれ',
  '神崎莉央',
  '井川葵',
  '小美山愛',
  '赤崎こころ',
  '長瀬麻奈',
]

/**
 * ユニット名
 */
export const UNIT_NAME = [
  'サニーピース',
  '月のテンペスト',
  'TRINITYAiLE',
  'LizNoir',
  'MACARON DONUTS',
  '長瀬麻奈',
  '川咲さくら',
  '兵藤雫×天動瑠依',
]
export const UNIT_NAME_ORDERING = arrayToOrdering(UNIT_NAME)

/**
 * アイドルのタイプ
 */
export const IDOL_TYPE = {
  vocal: 'ボーカル',
  dance: 'ダンス',
  visual: 'ビジュアル',
}

/**
 * アイドルのロール
 */
export const IDOL_ROLE = {
  scorer: 'スコアラー',
  buffer: 'バッファー',
  supporter: 'サポーター',
}

export const abilityEnhanceLabel = (enhance: AbilityEnhance, internal: boolean) =>
  internal
    ? `${enhance.type}${'value' in enhance ? ` ${enhance.value}` : ''}`
    : 'value' in enhance
    ? ABILITY_ENHANCE_WITH_VALUE[enhance.type].replace(/X/, enhance.value.toString())
    : ABILITY_ENHANCE_WITHOUT_VALUE[enhance.type]
export const buffAbilityTypeLabel = (type: BuffAbilityType, internal: boolean) =>
  internal ? type : BUFF_ABILITY_TYPE[type]
export const actionAbilityTypeLabel = (type: ActionAbilityType, internal: boolean) =>
  internal ? type : ACTION_ABILITY_TYPE[type]
// TODO: 専用のマッピングが合ったほうが良い気がする
export const abilityTargetLabel = (t: PassiveBuffTarget, internal: boolean) => {
  if (internal) {
    return t
  }
  const { target, targetSuffix } = extractBuffTarget(t)
  if (isBuffTargetWithoutSuffix(target)) {
    if (target === 'triggered') {
      return '発動対象'
    }
    return BUFF_TARGET_WITHOUT_SUFFIX[target]
  } else {
    return BUFF_TARGET_WITH_SUFFIX[target].replace(/X/, targetSuffix)
  }
}
export const abilityConditionTypeLabel = (condition: AbilityCondition, internal: boolean) =>
  internal
    ? `${condition.type}${'amount' in condition ? ` ${condition.amount}` : ''}`
    : 'amount' in condition
    ? ABILITY_CONDITION_WITH_VALUE[condition.type].replace(/X/, condition.amount.toString())
    : ABILITY_CONDITION_WITHOUT_VALUE[condition.type]
