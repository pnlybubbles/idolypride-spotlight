import { IdolData } from '~/utils/types'

export const REI_ICHINOSE: IdolData = {
  id: '1',
  userId: null,
  name: '一ノ瀬怜',
  title: '高台をかける薫風',
  role: 'buffer',
  type: 'dance',
  skills: [
    {
      id: 's1',
      name: '優勝への決意',
      type: 'a',
      index: 0,
      level: 1,
      ability: [
        {
          id: 'a1',
          div: 'buff',
          target: 'all',
          type: 'dance',
          condition: {
            type: 'none',
          },
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
      index: 1,
      level: 1,
      ability: [
        {
          div: 'buff',
          id: 'a2',
          target: 'self',
          type: 'critical-rate',
          condition: {
            type: 'none',
          },
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
      index: 2,
      level: 1,
      ability: [
        {
          div: 'action-buff',
          id: 'a3',
          target: 'self',
          type: 'ct-reduction',
          condition: {
            type: 'none',
          },
          amount: 11,
        },
      ],
      ct: 60,
    },
  ],
}

const reiOsorenai: IdolData = {
  id: '2',
  userId: null,
  name: '一ノ瀬怜',
  title: '失敗なんて恐れない',
  role: 'scorer',
  type: 'visual',
  skills: [
    {
      id: 's4',
      name: 'ウソみたいに、体が軽い',
      type: 'sp',
      index: 0,
      level: 1,
      ability: [],
    },
    {
      id: 's5',
      name: '負けず嫌いのダンス',
      type: 'a',
      index: 1,
      level: 1,
      ability: [
        {
          id: 'a4',
          div: 'buff',
          target: 'self',
          type: 'visual',
          condition: {
            type: 'none',
          },
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
      index: 2,
      level: 1,
      ability: [],
      ct: 50,
    },
  ],
}

const nagisaEmal: IdolData = {
  id: '3',
  userId: null,
  name: '伊吹渚',
  title: 'この瞬間の主役',
  role: 'scorer',
  type: 'vocal',
  skills: [
    {
      id: 's7',
      name: 'ここであのスマイル！',
      type: 'sp',
      index: 0,
      level: 1,
      ability: [
        {
          id: 'a5',
          div: 'buff',
          target: 'self',
          type: 'score',
          condition: {
            type: 'none',
          },
          amount: 11,
          span: 64,
        },
      ],
    },
    {
      id: 's8',
      name: '彼女が見ている景色',
      type: 'a',
      index: 1,
      level: 1,
      ability: [],
      ct: 50,
    },
    {
      id: 's9',
      name: '私も輝けたら',
      type: 'a',
      index: 2,
      level: 1,
      ability: [
        {
          id: 'a6',
          div: 'buff',
          target: 'self',
          type: 'critical-score',
          condition: {
            type: 'none',
          },
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
  userId: null,
  name: '井川葵',
  title: '濡れた髪は何を語る',
  role: 'buffer',
  type: 'dance',
  skills: [
    {
      id: 's10',
      name: '熱狂の余韻',
      type: 'a',
      index: 0,
      level: 1,
      ability: [
        {
          id: 'a8',
          div: 'buff',
          target: 'scorer-2',
          type: 'critical-rate',
          condition: {
            type: 'none',
          },
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
      index: 1,
      level: 1,
      ability: [
        {
          id: 'a9',
          div: 'action-buff',
          target: 'scorer-2',
          type: 'buff-span',
          condition: {
            type: 'none',
          },
          amount: 6,
        },
      ],
      ct: 50,
    },
    {
      id: 's12',
      name: '安堵の笑顔',
      type: 'p',
      index: 2,
      level: 1,
      ability: [
        {
          id: 'a10',
          div: 'buff',
          target: 'triggered',
          type: 'dance',
          condition: {
            type: 'none',
          },
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

export default characters
