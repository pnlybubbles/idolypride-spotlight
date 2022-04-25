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
