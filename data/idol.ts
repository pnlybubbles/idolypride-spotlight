import { mapArrayN, mapObject } from '~~/utils'
import { IdolData } from '~/utils/types'

export const REI_ICHINOSE: IdolData = {
  id: '1',
  name: '一ノ瀬怜',
  title: '高台をかける薫風',
  role: 'buffer',
  type: 'dance',
  skills: [
    {
      id: 's1',
      name: '優勝への決意',
      type: 'a',
      ability: [
        {
          id: 'a1',
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
      id: 's2',
      name: '踊る理由',
      type: 'p',
      trigger: {
        type: 'idle',
      },
      ability: [
        {
          div: 'buff',
          id: 'a2',
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
      id: 's3',
      name: '精一杯の恩返し',
      type: 'p',
      trigger: {
        type: 'critical',
      },
      ability: [
        {
          div: 'action-buff',
          id: 'a3',
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
  id: '2',
  name: '一ノ瀬怜',
  title: '失敗なんて恐れない',
  role: 'scorer',
  type: 'visual',
  skills: [
    {
      id: 's4',
      name: 'ウソみたいに、体が軽い',
      type: 'sp',
      ability: [],
    },
    {
      id: 's5',
      name: '負けず嫌いのダンス',
      type: 'a',
      ability: [
        {
          id: 'a4',
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
      id: 's6',
      name: 'スランプ脱却',
      type: 'a',
      ability: [],
      ct: 50,
    },
  ],
}

const nagisaEmal: IdolData = {
  id: '3',
  name: '伊吹渚',
  title: 'この瞬間の主役',
  role: 'scorer',
  type: 'vocal',
  skills: [
    {
      id: 's7',
      name: 'ここであのスマイル！',
      type: 'sp',
      ability: [
        {
          id: 'a5',
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
      id: 's8',
      name: '彼女が見ている景色',
      type: 'a',
      ability: [],
      ct: 50,
    },
    {
      id: 's9',
      name: '私も輝けたら',
      type: 'a',
      ability: [
        {
          id: 'a6',
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
  id: '4',
  name: '井川葵',
  title: '濡れた髪は何を語る',
  role: 'buffer',
  type: 'dance',
  skills: [
    {
      id: 's10',
      name: '熱狂の余韻',
      type: 'a',
      ability: [
        {
          id: 'a8',
          div: 'buff',
          target: 'scorer-2',
          type: 'critical-rate',
          condition: null,
          amount: 4,
          span: 72,
        },
      ],
      ct: 50,
    },
    {
      id: 's11',
      name: 'ステージの華',
      type: 'a',
      ability: [
        {
          id: 'a9',
          div: 'action-buff',
          target: 'scorer-2',
          type: 'buff-span',
          condition: null,
          amount: 6,
        },
      ],
      ct: 50,
    },
    {
      id: 's12',
      name: '安堵の笑顔',
      type: 'p',
      trigger: {
        type: 'sp',
      },
      ability: [
        {
          id: 'a10',
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
