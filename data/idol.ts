type SkillData = {
  label: string
  ability: {
    type: 'buff'
    buff:
      | 'vocal'
      | 'dance'
      | 'visual'
      | 'critical'
      | 'critical-score'
      | 'ct'
      | 'score'
      | 'beat-score'
      | 'a-score'
      | 'sp-score'
      | 'stamina'
      | 'buff-beat'
      | 'buff-amount'
    target: 'all' | 'self' | '2scorers' | 'scorer' | 'any-sp' | 'any-a'
    amount: number
    span: number
  }[]
} & (
  | {
      type: 'sp'
    }
  | {
      type: 'a'
      ct: number
    }
  | {
      type: 'p'
      ct: number
      trigger:
        | {
            type: 'idle' | 'critical'
          }
        | {
            type: 'combo'
            amount: 50
          }
    }
)

interface IdolData {
  name: string
  sub: string
  skills: SkillData[]
}

const reiTakadai: IdolData = {
  name: '一ノ瀬怜',
  sub: '高台をかける薫風',
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

const characters = {
  reiOsorenai,
  reiTakadai,
}

const charactersWithIndex = Object.fromEntries(
  Object.entries(characters).map(([id, v]) => [id, { ...v, skills: v.skills.map((w, index) => ({ ...w, index })) }])
)

export type Idol = typeof charactersWithIndex[string]
export type Skill = Idol['skills'][number]

export default charactersWithIndex
