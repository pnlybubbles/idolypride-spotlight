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
  SKILL_TRIGGER_WITHOUT_VALUE,
  SKILL_TRIGGER_WITH_VALUE,
} from '~~/utils/formatter'
import {
  AbilityCondition,
  AbilityEnhance,
  ActionAbilityType,
  BuffAbilityType,
  PassiveBuffTarget,
  SkillTrigger,
} from '~~/utils/types'

export const LANES = [0, 1, 2, 3, 4] as const
export const SKILLS = [0, 1, 2] as const
export const SKILL_LEVEL_MAX = [6, 6, 4] as const

export const px = (value: number) => `${value}px`

export const arrayToOrdering = <T>(array: readonly T[]) => {
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
  'fran',
  'kana',
  'miho',
] as const
export type IdolName = typeof IDOL_NAME[number]

/**
 * ユニット名
 */
export const UNIT_NAME = [
  'サニーピース',
  '月のテンペスト',
  'TRINITYAiLE',
  'LizNoir',
  'ⅢX',
  'MACARON DONUTS',
  '長瀬麻奈',
  '川咲さくら',
  '兵藤雫×天動瑠依',
  '白石沙季×白石千紗',
  '星見プロダクション',
] as const
export type UnitName = typeof UNIT_NAME[number]
export const UNIT_NAME_ORDERING = arrayToOrdering(UNIT_NAME)

export const UNIT_TO_IDOL_NAME: Record<UnitName, IdolName[]> = {
  月のテンペスト: ['長瀬琴乃', '伊吹渚', '白石沙季', '成宮すず', '早坂芽衣'],
  サニーピース: ['川咲さくら', '兵藤雫', '白石千紗', '一ノ瀬怜', '佐伯遙子'],
  TRINITYAiLE: ['天動瑠依', '鈴村優', '奥山すみれ'],
  LizNoir: ['神崎莉央', '井川葵', '小美山愛', '赤崎こころ', '長瀬麻奈'],
  'MACARON DONUTS': ['一ノ瀬怜', '早坂芽衣'],
  ⅢX: ['fran', 'kana', 'miho'],
  長瀬麻奈: ['長瀬麻奈'],
  川咲さくら: ['川咲さくら'],
  '兵藤雫×天動瑠依': ['兵藤雫', '天動瑠依'],
  '白石沙季×白石千紗': ['白石沙季', '白石千紗'],
  星見プロダクション: [],
}

/**
 * アイドルのタイプ
 */
export const IDOL_TYPE = {
  vocal: 'ボーカル',
  dance: 'ダンス',
  visual: 'ビジュアル',
} as const

/**
 * アイドルのロール
 */
export const IDOL_ROLE = {
  scorer: 'スコアラー',
  buffer: 'バッファー',
  supporter: 'サポーター',
} as const

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
export const skillTriggerTypeLabel = (trigger: SkillTrigger, internal: boolean) =>
  internal
    ? `${trigger.type}${'amount' in trigger ? ` ${trigger.amount}` : ''}`
    : 'amount' in trigger
    ? SKILL_TRIGGER_WITH_VALUE[trigger.type].replace(/X/, trigger.amount.toString())
    : SKILL_TRIGGER_WITHOUT_VALUE[trigger.type]

// 本来なら Listbox.vue にあるべきだが、.vueのインポート問題でココにおいておく
export type Option<T> = { id: T; label: string }[]
export const objToOption = <K extends string>(obj: Record<K, string>): Option<K> =>
  Object.entries(obj).map(([id, label]) => ({ id, label })) as Option<K>
export const arrayToOption = (array: readonly string[]): Option<string> => array.map((id) => ({ id, label: id }))

export type ExcludeUnknown<T> = Exclude<T, 'unknown'>
export const omitOption =
  <S>(id: S) =>
  <T>(opt: Option<T | S>) =>
    opt.filter((v) => v.id !== id) as Option<T>
export const omitUnknownOption = omitOption('unknown' as const)
