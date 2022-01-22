type SkillData = {
  label: string;
  target: "all" | "self" | "2scorers" | "scorer" | "any-sp" | "any-a";
  buff:
    | "vocal"
    | "dance"
    | "visual"
    | "critical"
    | "critical-score"
    | "ct"
    | "score"
    | "beat-score"
    | "a-score"
    | "sp-score"
    | "stamina"
    | "buff-beat"
    | "buff-amount";
  amount: number;
  span: number;
  ct: number;
} & (
  | {
      type: "a" | "sp";
    }
  | {
      type: "p";
      trigger:
        | {
            type: "idle" | "critical";
          }
        | {
            type: "combo";
            amount: 50;
          };
    }
);

interface IdolData {
  name: string;
  sub: string;
  skills: SkillData[];
}

const reiTakadai: IdolData = {
  name: "一ノ瀬怜",
  sub: "高台をかける薫風",
  skills: [
    {
      label: "優勝への決意",
      type: "a",
      target: "all",
      buff: "dance",
      amount: 4,
      span: 15,
      ct: 30,
    },
    {
      label: "踊る理由",
      type: "p",
      trigger: {
        type: "idle",
      },
      target: "self",
      buff: "critical",
      amount: 2,
      span: 30,
      ct: 50,
    },
    {
      label: "精一杯の恩返し",
      type: "p",
      trigger: {
        type: "critical",
      },
      target: "self",
      buff: "ct",
      amount: 11,
      span: 0,
      ct: 60,
    },
  ],
};

const reiOsorenai: IdolData = {
  name: "一ノ瀬怜",
  sub: "高台をかける薫風",
  skills: [
    {
      label: "優勝への決意",
      type: "sp",
      target: "all",
      buff: "dance",
      amount: 4,
      span: 15,
      ct: 30,
    },
    {
      label: "踊る理由",
      type: "p",
      trigger: {
        type: "idle",
      },
      target: "self",
      buff: "critical",
      amount: 2,
      span: 30,
      ct: 50,
    },
    {
      label: "精一杯の恩返し",
      type: "p",
      trigger: {
        type: "critical",
      },
      target: "self",
      buff: "ct",
      amount: 11,
      span: 0,
      ct: 60,
    },
  ],
};

const characters = {
  reiOsorenai,
  reiTakadai,
};

const charactersWithIndex = Object.fromEntries(
  Object.entries(characters).map(([id, v]) => [
    id,
    { ...v, skills: v.skills.map((w, index) => ({ ...w, index })) },
  ])
);

export type Idol = (typeof charactersWithIndex)[string]
export type Skill = Idol['skills'][number]

export default charactersWithIndex;
