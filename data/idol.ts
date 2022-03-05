import { mapArrayN, mapObject } from '~~/utils'
import { IdolData } from '~/utils/types'

export const REI_ICHINOSE: IdolData = {
  name: '一ノ瀬怜',
  title: '高台をかける薫風',
  role: 'buffer',
  type: 'dance',
  skills: [
    {
      name: '優勝への決意',
      type: 'a',
      ability: [
        {
          div: 'buff',
          target: 'all',
          type: 'dance',
          condition: null,
          amount: 4,
          span: 15,
        },
      ],
      ct: 30,
    },
    {
      name: '踊る理由',
      type: 'p',
      trigger: {
        type: 'idle',
      },
      ability: [
        {
          div: 'buff',
          target: 'self',
          type: 'critical-rate',
          condition: null,
          amount: 2,
          span: 30,
        },
      ],
      ct: 50,
    },
    {
      name: '精一杯の恩返し',
      type: 'p',
      trigger: {
        type: 'critical',
      },
      ability: [
        {
          div: 'action-buff',
          target: 'self',
          type: 'ct-reduction',
          condition: null,
          amount: 11,
        },
      ],
      ct: 60,
    },
  ],
}

const reiOsorenai: IdolData = {
  name: '一ノ瀬怜',
  title: '失敗なんて恐れない',
  role: 'scorer',
  type: 'visual',
  skills: [
    {
      name: 'ウソみたいに、体が軽い',
      type: 'sp',
      ability: [],
    },
    {
      name: '負けず嫌いのダンス',
      type: 'a',
      ability: [
        {
          div: 'buff',
          target: 'self',
          type: 'visual',
          condition: null,
          amount: 8,
          span: 45,
        },
      ],
      ct: 50,
    },
    {
      name: 'スランプ脱却',
      type: 'a',
      ability: [],
      ct: 50,
    },
  ],
}

const nagisaEmal: IdolData = {
  name: '伊吹渚',
  title: 'この瞬間の主役',
  role: 'scorer',
  type: 'vocal',
  skills: [
    {
      name: 'ここであのスマイル！',
      type: 'sp',
      ability: [
        {
          div: 'buff',
          target: 'self',
          type: 'score',
          condition: null,
          amount: 11,
          span: 64,
        },
      ],
    },
    {
      name: '彼女が見ている景色',
      type: 'a',
      ability: [],
      ct: 50,
    },
    {
      name: '私も輝けたら',
      type: 'a',
      ability: [
        {
          div: 'buff',
          target: 'self',
          type: 'critical-score',
          condition: null,
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
  title: '濡れた髪は何を語る',
  role: 'buffer',
  type: 'dance',
  skills: [
    {
      name: '熱狂の余韻',
      type: 'a',
      ability: [
        {
          div: 'buff',
          target: '2-scorer',
          type: 'critical-rate',
          condition: null,
          amount: 4,
          span: 72,
        },
      ],
      ct: 50,
    },
    {
      name: 'ステージの華',
      type: 'a',
      ability: [
        {
          div: 'action-buff',
          target: '2-scorer',
          type: 'buff-span',
          condition: null,
          amount: 6,
        },
      ],
      ct: 50,
    },
    {
      name: '安堵の笑顔',
      type: 'p',
      trigger: {
        type: 'sp',
      },
      ability: [
        {
          div: 'buff',
          target: 'triggered',
          type: 'dance',
          condition: null,
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
