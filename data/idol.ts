import { mapArrayN, mapObject } from '~~/utils'
import { IdolData } from '~/utils/types'

export const REI_ICHINOSE: IdolData = {
  name: '一ノ瀬怜',
  sub: '高台をかける薫風',
  role: 'buffer',
  type: 'dance',
  skills: [
    {
      label: '優勝への決意',
      type: 'a',
      ability: [
        {
          type: 'buff',
          target: 'all',
          buff: 'dance',
          amount: 4,
          span: 15,
        },
      ],
      ct: 30,
    },
    {
      label: '踊る理由',
      type: 'p',
      trigger: {
        type: 'idle',
      },
      ability: [
        {
          type: 'buff',
          target: 'self',
          buff: 'critical',
          amount: 2,
          span: 30,
        },
      ],
      ct: 50,
    },
    {
      label: '精一杯の恩返し',
      type: 'p',
      trigger: {
        type: 'critical',
      },
      ability: [
        {
          type: 'buff',
          target: 'self',
          buff: 'ct',
          amount: 11,
          span: 0,
        },
      ],
      ct: 60,
    },
  ],
}

const reiOsorenai: IdolData = {
  name: '一ノ瀬怜',
  sub: '失敗なんて恐れない',
  role: 'scorer',
  type: 'visual',
  skills: [
    {
      label: 'ウソみたいに、体が軽い',
      type: 'sp',
      ability: [],
    },
    {
      label: '負けず嫌いのダンス',
      type: 'a',
      ability: [
        {
          type: 'buff',
          target: 'self',
          buff: 'visual',
          amount: 8,
          span: 45,
        },
      ],
      ct: 50,
    },
    {
      label: 'スランプ脱却',
      type: 'a',
      ability: [],
      ct: 50,
    },
  ],
}

const nagisaEmal: IdolData = {
  name: '伊吹渚',
  sub: 'この瞬間の主役',
  role: 'scorer',
  type: 'vocal',
  skills: [
    {
      label: 'ここであのスマイル！',
      type: 'sp',
      ability: [
        {
          type: 'buff',
          target: 'self',
          buff: 'score',
          amount: 11,
          span: 64,
        },
      ],
    },
    {
      label: '彼女が見ている景色',
      type: 'a',
      ability: [],
      ct: 50,
    },
    {
      label: '私も輝けたら',
      type: 'a',
      ability: [
        {
          type: 'buff',
          target: 'self',
          buff: 'critical-score',
          amount: 4,
          span: 43,
        },
      ],
      ct: 50,
    },
  ],
}

const aoiNureta: IdolData = {
  name: '井川葵',
  sub: '濡れた髪は何を語る',
  role: 'buffer',
  type: 'dance',
  skills: [
    {
      label: '熱狂の余韻',
      type: 'a',
      ability: [
        {
          type: 'buff',
          target: '2-scorers',
          buff: 'critical',
          amount: 4,
          span: 72,
        },
      ],
      ct: 50,
    },
    {
      label: 'ステージの華',
      type: 'a',
      ability: [
        {
          type: 'buff',
          target: '2-scorers',
          buff: 'buff-span',
          amount: 6,
          span: 0,
        },
      ],
      ct: 50,
    },
    {
      label: '安堵の笑顔',
      type: 'p',
      trigger: {
        type: 'sp',
      },
      ability: [
        {
          type: 'buff',
          target: 'triggered',
          buff: 'dance',
          amount: 8,
          span: 27,
        },
      ],
      ct: 50,
    },
  ],
}

const characters = {
  reiOsorenai,
  reiTakadai: REI_ICHINOSE,
  nagisaEmal,
  aoiNureta,
}

const charactersWithIndex = mapObject(characters, (v) => ({
  ...v,
  skills: mapArrayN(v.skills, (w, index) => ({ ...w, index })),
}))

export type IdolId = keyof typeof charactersWithIndex
export type Idol = typeof charactersWithIndex[IdolId]
export type Skill = Idol['skills'][number]

export default charactersWithIndex
