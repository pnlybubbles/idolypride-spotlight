import { Result, simulate } from './simulate'
import {
  AbilityCondition,
  AbilityData,
  AbilityType,
  ActiveBuffTarget,
  IdolData,
  IdolType,
  LiveData,
  PassiveAbilityData,
  PassiveBuffTarget,
  SkillData,
  SkillTrigger,
} from '~~/utils/types'
import { ArrayN, mapArrayN, unitArrayN, unreachable } from '~~/utils'
import { isActionAbilityType, isBuffAbilityType } from '~~/utils/formatter'

const mockLive = ({ sp, a, beat }: { sp?: LiveData['sp']; a?: LiveData['a']; beat?: number }): LiveData => ({
  id: 'mock',
  title: 'MOCK',
  sp: sp ?? [[], [], [], [], []],
  a: a ?? [[], [], [], [], []],
  beat: Math.max(...[...(sp?.flat() ?? []), ...(a?.flat() ?? []), beat ?? 1]),
  unit: 'UNIT',
})

const mockIdol = ({
  type,
  role,
  skills,
  preset,
  a1,
  p1,
  p2,
  p1Trigger,
  p2Trigger,
}: Partial<Pick<IdolData, 'role' | 'type' | 'skills'>> & {
  preset?: 'sp_a_a' | 'a_p_p'
  a1?: AbilityData
  p1?: PassiveAbilityData
  p2?: PassiveAbilityData
  p1Trigger?: SkillTrigger
  p2Trigger?: SkillTrigger
}): IdolData => {
  const presetSkills: IdolData['skills'] =
    preset === 'sp_a_a' || preset === undefined
      ? [mockSPSkill(0, []), mockASkill(1, a1 ? [a1] : [], 50), mockASkill(2, [], 50)]
      : preset === 'a_p_p'
      ? [
          mockASkill(0, a1 ? [a1] : [], 30),
          mockPSkill(1, p1 ? [p1] : [], p1Trigger, 50),
          mockPSkill(2, p2 ? [p2] : [], p2Trigger, 50),
        ]
      : unreachable(preset)
  return {
    id: 'nagisa',
    name: '伊吹渚',
    title: 'mock_title',
    role: role ?? 'scorer',
    type: type ?? 'vocal',
    userId: 'mock_user',
    owned: null,
    skills: skills ?? presetSkills,
  }
}

const mockLane = ({ type }: { type?: ArrayN<IdolType | null, 5> } = {}) =>
  mapArrayN(unitArrayN(5), (i) => ({ type: type?.[i] ?? null }))

const mockSPSkill = (index: 0 | 1 | 2, ability: AbilityData[]): Extract<SkillData, { type: 'sp' }> => ({
  id: `skill_${index}`,
  index,
  level: 1,
  name: `SP SKILL`,
  type: 'sp',
  ability: ability,
})

const mockASkill = (index: 0 | 1 | 2, ability: AbilityData[], ct?: number): Extract<SkillData, { type: 'a' }> => ({
  id: `skill_${index}`,
  index,
  level: 1,
  name: `A SKILL`,
  type: 'a',
  ability: ability,
  ct: ct ?? 30,
})

const mockPSkill = (
  index: 0 | 1 | 2,
  ability: PassiveAbilityData[],
  trigger?: SkillTrigger,
  ct?: number
): Extract<SkillData, { type: 'p' }> => ({
  id: `skill_${index}`,
  index,
  level: 1,
  name: `P SKILL`,
  type: 'p',
  ability,
  ct: ct ?? 30,
  trigger: trigger ?? { type: 'unknown' },
})

type MockAbility = {
  (props: {
    condition?: AbilityCondition
    span?: number
    target: 'triggered'
    type: AbilityType | 'get-score'
    amount?: number
  }): PassiveAbilityData
  (props: {
    condition?: AbilityCondition
    span?: number
    target?: ActiveBuffTarget
    type: AbilityType | 'get-score'
    amount?: number
  }): AbilityData
}
const mockAbility: MockAbility = ({
  type,
  condition,
  span,
  target,
  amount,
}: {
  condition?: AbilityCondition
  span?: number
  target?: PassiveBuffTarget
  type: AbilityType | 'get-score'
  amount?: number
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
}): any =>
  type === 'get-score'
    ? {
        div: 'score',
        amount: 1000,
        condition: condition ?? {
          type: 'none',
        },
        enhance: {
          type: 'none',
        },
        id: 'mock_ability',
      }
    : isBuffAbilityType(type)
    ? {
        div: 'buff',
        amount: amount ?? 4,
        target: target === undefined ? 'all' : target,
        type,
        condition: condition ?? {
          type: 'none',
        },
        id: 'mock_ability',
        span: span ?? 10,
      }
    : isActionAbilityType(type)
    ? {
        div: 'action-buff',
        amount: amount ?? 7,
        target: target === undefined ? 'all' : target,
        type,
        condition: condition ?? {
          type: 'none',
        },
        id: 'mock_ability',
      }
    : unreachable(type)

test('単純なサンプル', () => {
  expect(simulate(mockLive({}), [null, null, null, null, null], mockLane())).toStrictEqual({
    result: [],
    state: [],
    shift: [],
  })
})

test('Aスキルが発動する', () => {
  const expected: Result = [
    {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      id: expect.any(String),
      type: 'a',
      beat: 1,
      buff: 'unknown',
      lane: 0,
      index: 0,
      fail: false,
      activated: [],
    },
  ]
  expect(
    simulate(
      mockLive({ a: [[1], [], [], [], []] }),
      [mockIdol({ preset: 'a_p_p' }), null, null, null, null],
      mockLane()
    ).result
  ).toStrictEqual(expected)
})

test('センターにバフが乗る', () => {
  const expected: Result = [
    {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      id: expect.any(String),
      type: 'a',
      beat: 1,
      buff: 'score',
      lane: 0,
      index: 0,
      fail: false,
      activated: [],
    },
    {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      id: expect.any(String),
      type: 'buff',
      beat: 1,
      buff: 'score',
      lane: 2,
      affected: false,
      amount: 4,
      span: 1,
    },
  ]
  expect(
    simulate(
      mockLive({ a: [[1], [], [], [], []] }),
      [mockIdol({ preset: 'a_p_p', a1: mockAbility({ type: 'score', target: 'center' }) }), null, null, null, null],
      mockLane()
    ).result
  ).toStrictEqual(expected)
})

test('隣接にバフが乗る', () => {
  const expected: Result = [
    {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      id: expect.any(String),
      type: 'a',
      beat: 1,
      buff: 'score',
      lane: 1,
      index: 0,
      fail: false,
      activated: [],
    },
    {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      id: expect.any(String),
      type: 'buff',
      beat: 1,
      buff: 'score',
      lane: 0,
      affected: false,
      amount: 4,
      span: 1,
    },
    {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      id: expect.any(String),
      type: 'buff',
      beat: 1,
      buff: 'score',
      lane: 2,
      affected: false,
      amount: 4,
      span: 1,
    },
  ]
  expect(
    simulate(
      mockLive({ a: [[], [1], [], [], []] }),
      [null, mockIdol({ preset: 'a_p_p', a1: mockAbility({ type: 'score', target: 'neighbor' }) }), null, null, null],
      mockLane()
    ).result
  ).toStrictEqual(expected)
})

test('端の場合には隣接1人にバフが乗る', () => {
  const expected: Result = [
    {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      id: expect.any(String),
      type: 'a',
      beat: 1,
      buff: 'score',
      lane: 0,
      index: 0,
      fail: false,
      activated: [],
    },
    {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      id: expect.any(String),
      type: 'buff',
      beat: 1,
      buff: 'score',
      lane: 1,
      affected: false,
      amount: 4,
      span: 1,
    },
  ]
  expect(
    simulate(
      mockLive({ a: [[1], [], [], [], []] }),
      [mockIdol({ preset: 'a_p_p', a1: mockAbility({ type: 'score', target: 'neighbor' }) }), null, null, null, null],
      mockLane()
    ).result
  ).toStrictEqual(expected)
})

test('ダンスタイプにバフが乗る', () => {
  const expected: Result = [
    {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      id: expect.any(String),
      type: 'a',
      beat: 1,
      buff: 'score',
      lane: 0,
      index: 0,
      fail: false,
      activated: [],
    },
    {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      id: expect.any(String),
      type: 'buff',
      beat: 1,
      buff: 'score',
      lane: 1,
      affected: false,
      amount: 4,
      span: 1,
    },
  ]
  expect(
    simulate(
      mockLive({ a: [[1], [], [], [], []] }),
      [
        mockIdol({ preset: 'a_p_p', type: 'visual', a1: mockAbility({ type: 'score', target: 'dance-1' }) }),
        mockIdol({ type: 'dance' }),
        mockIdol({ type: 'visual' }),
        null,
        null,
      ],
      mockLane()
    ).result
  ).toStrictEqual(expected)
})

test('一致するタイプがない場合はバフが乗らない', () => {
  const expected: Result = [
    {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      id: expect.any(String),
      type: 'a',
      beat: 1,
      buff: 'score',
      lane: 0,
      index: 0,
      fail: false,
      activated: [],
    },
  ]
  expect(
    simulate(
      mockLive({ a: [[1], [], [], [], []] }),
      [
        mockIdol({ preset: 'a_p_p', type: 'visual', a1: mockAbility({ type: 'score', target: 'dance-1' }) }),
        mockIdol({ type: 'visual' }),
        mockIdol({ type: 'visual' }),
        null,
        null,
      ],
      mockLane()
    ).result
  ).toStrictEqual(expected)
})

test('ダンスレーンにバフが乗る', () => {
  const expected: Result = [
    {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      id: expect.any(String),
      type: 'a',
      beat: 1,
      buff: 'score',
      lane: 0,
      index: 0,
      fail: false,
      activated: [],
    },
    {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      id: expect.any(String),
      type: 'buff',
      beat: 1,
      buff: 'score',
      lane: 1,
      affected: false,
      amount: 4,
      span: 1,
    },
  ]
  expect(
    simulate(
      mockLive({ a: [[1], [], [], [], []] }),
      [
        mockIdol({ preset: 'a_p_p', a1: mockAbility({ type: 'score', target: 'dance-lane-1' }) }),
        mockIdol({}),
        mockIdol({}),
        null,
        null,
      ],
      mockLane({ type: [null, 'dance', 'visual', null, null] })
    ).result
  ).toStrictEqual(expected)
})

test('レーン情報がない場合にダンスレーンでバフが乗らない', () => {
  const expected: Result = [
    {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      id: expect.any(String),
      type: 'a',
      beat: 1,
      buff: 'score',
      lane: 0,
      index: 0,
      fail: false,
      activated: [],
    },
  ]
  expect(
    simulate(
      mockLive({ a: [[1], [], [], [], []] }),
      [
        mockIdol({ preset: 'a_p_p', type: 'vocal', a1: mockAbility({ type: 'score', target: 'dance-lane-1' }) }),
        mockIdol({ type: 'vocal' }),
        mockIdol({ type: 'vocal' }),
        null,
        null,
      ],
      mockLane()
    ).result
  ).toStrictEqual(expected)
})

test('CT中の場合はAスキルが失敗する', () => {
  const expected: Result = [
    {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      id: expect.any(String),
      type: 'a',
      beat: 1,
      buff: 'unknown',
      lane: 0,
      index: 0,
      fail: false,
      activated: [],
    },
    {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      id: expect.any(String),
      type: 'a',
      beat: 5,
      buff: 'unknown',
      lane: 0,
      index: undefined,
      fail: true,
      activated: [],
    },
  ]
  expect(
    simulate(
      mockLive({ a: [[1, 5], [], [], [], []] }),
      [mockIdol({ preset: 'a_p_p' }), null, null, null, null],
      mockLane()
    ).result
  ).toStrictEqual(expected)
})

test('CTピッタリのギャップの場合はAスキルが発動する', () => {
  const expected: Result = [
    {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      id: expect.any(String),
      type: 'a',
      beat: 20,
      buff: 'unknown',
      lane: 0,
      index: 0,
      fail: false,
      activated: [],
    },
    {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      id: expect.any(String),
      type: 'a',
      beat: 50,
      buff: 'unknown',
      lane: 0,
      index: 0,
      fail: false,
      activated: [],
    },
  ]
  expect(
    simulate(
      mockLive({ a: [[20, 50], [], [], [], []] }),
      [mockIdol({ preset: 'a_p_p' }), null, null, null, null],
      mockLane()
    ).result
  ).toStrictEqual(expected)
})

test('CT中の場合は2番目のAスキルが発動する', () => {
  const expected: Result = [
    {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      id: expect.any(String),
      type: 'a',
      beat: 1,
      buff: 'unknown',
      lane: 0,
      index: 1,
      fail: false,
      activated: [],
    },
    {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      id: expect.any(String),
      type: 'a',
      beat: 5,
      buff: 'unknown',
      lane: 0,
      index: 2,
      fail: false,
      activated: [],
    },
  ]
  expect(
    simulate(
      mockLive({ a: [[1, 5], [], [], [], []] }),
      [mockIdol({ preset: 'sp_a_a' }), null, null, null, null],
      mockLane()
    ).result
  ).toStrictEqual(expected)
})

test('SPスキルが発動する', () => {
  const expected: Result = [
    {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      id: expect.any(String),
      type: 'sp',
      beat: 1,
      buff: 'unknown',
      lane: 0,
      index: 0,
      fail: false,
      activated: [],
    },
  ]
  expect(
    simulate(
      mockLive({ sp: [[1], [], [], [], []] }),
      [mockIdol({ preset: 'sp_a_a' }), null, null, null, null],
      mockLane()
    ).result
  ).toStrictEqual(expected)
})

test('SPを持っていない場合には失敗する', () => {
  const expected: Result = [
    {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      id: expect.any(String),
      type: 'sp',
      beat: 1,
      buff: 'unknown',
      lane: 0,
      index: undefined,
      fail: true,
      activated: [],
    },
  ]
  expect(
    simulate(
      mockLive({ sp: [[1], [], [], [], []] }),
      [mockIdol({ preset: 'a_p_p' }), null, null, null, null],
      mockLane()
    ).result
  ).toStrictEqual(expected)
})

test('Pスキルが発動する', () => {
  const expected: Result = [
    {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      id: expect.any(String),
      type: 'p',
      beat: 0,
      buff: 'vocal',
      lane: 0,
      index: 1,
    },
    {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      id: expect.any(String),
      type: 'buff',
      beat: 0,
      buff: 'vocal',
      lane: 0,
      affected: false,
      amount: 4,
      span: 10,
    },
  ]
  expect(
    simulate(
      mockLive({ beat: 20 }),
      [
        mockIdol({ preset: 'a_p_p', p1: mockAbility({ type: 'vocal', target: 'self' }), p1Trigger: { type: 'none' } }),
        null,
        null,
        null,
        null,
      ],
      mockLane()
    ).result
  ).toStrictEqual(expected)
})

test('無条件の場合、CTが終わった瞬間にPスキルが発動する', () => {
  const expected: Result = [
    {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      id: expect.any(String),
      type: 'p',
      beat: 0,
      buff: 'vocal',
      lane: 0,
      index: 1,
    },
    {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      id: expect.any(String),
      type: 'buff',
      beat: 0,
      buff: 'vocal',
      lane: 0,
      affected: false,
      amount: 4,
      span: 10,
    },
    {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      id: expect.any(String),
      type: 'p',
      beat: 50,
      buff: 'vocal',
      lane: 0,
      index: 1,
    },
    {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      id: expect.any(String),
      type: 'buff',
      beat: 50,
      buff: 'vocal',
      lane: 0,
      affected: false,
      amount: 4,
      span: 10,
    },
  ]
  expect(
    simulate(
      mockLive({ beat: 70 }),
      [
        mockIdol({ preset: 'a_p_p', p1: mockAbility({ type: 'vocal', target: 'self' }), p1Trigger: { type: 'none' } }),
        null,
        null,
        null,
        null,
      ],
      mockLane()
    ).result
  ).toStrictEqual(expected)
})

test('無条件のPスキルが2つある場合には3番目が先に発動して次にビートで2番目が発動する', () => {
  const expected: Result = [
    {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      id: expect.any(String),
      type: 'p',
      beat: 0,
      buff: 'vocal',
      lane: 0,
      index: 1,
    },
    {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      id: expect.any(String),
      type: 'buff',
      beat: 0,
      buff: 'vocal',
      lane: 0,
      affected: false,
      amount: 4,
      span: 10,
    },
    {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      id: expect.any(String),
      type: 'p',
      beat: 1,
      buff: 'score',
      lane: 0,
      index: 2,
    },
    {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      id: expect.any(String),
      type: 'buff',
      beat: 1,
      buff: 'score',
      lane: 0,
      affected: false,
      amount: 4,
      span: 10,
    },
  ]
  expect(
    simulate(
      mockLive({ beat: 20 }),
      [
        mockIdol({
          preset: 'a_p_p',
          p1: mockAbility({ type: 'vocal', target: 'self' }),
          p1Trigger: { type: 'none' },
          p2: mockAbility({ type: 'score', target: 'self' }),
          p2Trigger: { type: 'none' },
        }),
        null,
        null,
        null,
        null,
      ],
      mockLane()
    ).result
  ).toStrictEqual(expected)
})

test('Aスキル発動前の条件でPスキルが発動する', () => {
  const expected: Result = [
    {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      id: expect.any(String),
      type: 'a',
      beat: 5,
      buff: 'unknown',
      lane: 1,
      index: 0,
      fail: false,
      activated: [{ type: 'vocal', amount: 4 }],
    },
    {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      id: expect.any(String),
      type: 'p',
      beat: 5,
      buff: 'vocal',
      lane: 0,
      index: 1,
    },
    {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      id: expect.any(String),
      type: 'buff',
      beat: 5,
      buff: 'vocal',
      lane: 1,
      affected: true,
      amount: 4,
      span: 1,
    },
  ]
  expect(
    simulate(
      mockLive({ a: [[], [5], [], [], []] }),
      [
        mockIdol({
          preset: 'a_p_p',
          p1: mockAbility({ type: 'vocal', target: 'triggered' }),
          p1Trigger: { type: 'a' },
        }),
        mockIdol({ preset: 'a_p_p', a1: mockAbility({ type: 'get-score' }) }),
        null,
        null,
        null,
      ],
      mockLane()
    ).result
  ).toStrictEqual(expected)
})

test('スコアアップ状態の時にPスキルが発動する', () => {
  const expected: Result = [
    {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      id: expect.any(String),
      type: 'a',
      beat: 5,
      buff: 'score',
      lane: 0,
      index: 0,
      fail: false,
      activated: [
        { type: 'score', amount: 4 },
        { type: 'vocal', amount: 4 },
      ],
    },
    {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      id: expect.any(String),
      type: 'buff',
      beat: 5,
      buff: 'score',
      lane: 0,
      affected: true,
      amount: 4,
      span: 1,
    },
    {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      id: expect.any(String),
      type: 'p',
      beat: 5,
      buff: 'vocal',
      lane: 0,
      index: 1,
    },
    {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      id: expect.any(String),
      type: 'buff',
      beat: 5,
      buff: 'vocal',
      lane: 0,
      affected: true,
      amount: 4,
      span: 1,
    },
  ]
  expect(
    simulate(
      mockLive({ a: [[5], [], [], [], []] }),
      [
        mockIdol({
          preset: 'a_p_p',
          a1: mockAbility({ type: 'score', target: 'self' }),
          p1: mockAbility({ type: 'vocal', target: 'self' }),
          p1Trigger: { type: 'score-up' },
        }),
        null,
        null,
        null,
        null,
      ],
      mockLane()
    ).result
  ).toStrictEqual(expected)
})

test('誰かがテンションアップ状態の時にPスキルが発動する', () => {
  const expected: Result = [
    {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      id: expect.any(String),
      type: 'a',
      beat: 5,
      buff: 'tension',
      lane: 0,
      index: 0,
      fail: false,
      activated: [],
    },
    {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      id: expect.any(String),
      type: 'buff',
      beat: 5,
      buff: 'tension',
      lane: 2,
      affected: false,
      amount: 4,
      span: 1,
    },
    {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      id: expect.any(String),
      type: 'p',
      beat: 5,
      buff: 'dance',
      lane: 0,
      index: 1,
    },
    {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      id: expect.any(String),
      type: 'buff',
      beat: 5,
      buff: 'dance',
      lane: 2,
      affected: false,
      amount: 4,
      span: 1,
    },
  ]
  expect(
    simulate(
      mockLive({ a: [[5], [], [], [], []] }),
      [
        mockIdol({
          preset: 'a_p_p',
          a1: mockAbility({ type: 'tension', target: 'center' }),
          p1: mockAbility({ type: 'dance', target: 'center' }),
          p1Trigger: { type: 'anyone-tension-up' },
        }),
        null,
        null,
        null,
        null,
      ],
      mockLane()
    ).result
  ).toStrictEqual(expected)
})

test('AスキルによるCT減少によってCT間隔未満のAスキル発動が成功する', () => {
  const expected: Result = [
    {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      id: expect.any(String),
      type: 'a',
      beat: 5,
      buff: 'unknown',
      lane: 2,
      index: 0,
      fail: false,
      activated: [],
    },
    {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      id: expect.any(String),
      type: 'a',
      beat: 10,
      buff: 'ct-reduction',
      lane: 0,
      index: 0,
      fail: false,
      activated: [],
    },
    {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      id: expect.any(String),
      type: 'a',
      beat: 30,
      buff: 'unknown',
      lane: 2,
      index: 0,
      fail: false,
      activated: [],
    },
  ]
  const { result } = simulate(
    mockLive({ a: [[10], [], [5, 30], [], []] }),
    [
      mockIdol({
        preset: 'a_p_p',
        a1: mockAbility({ type: 'ct-reduction', target: 'center', amount: 10 }),
      }),
      null,
      mockIdol({ preset: 'a_p_p' }),
      null,
      null,
    ],
    mockLane()
  )
  expect(result).toStrictEqual(expected)
})

test('AスキルによるCT減少によってピッタリCT間隔のAスキル発動が成功する', () => {
  const expected: Result = [
    {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      id: expect.any(String),
      type: 'a',
      beat: 5,
      buff: 'unknown',
      lane: 2,
      index: 0,
      fail: false,
      activated: [],
    },
    {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      id: expect.any(String),
      type: 'a',
      beat: 10,
      buff: 'ct-reduction',
      lane: 0,
      index: 0,
      fail: false,
      activated: [],
    },
    {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      id: expect.any(String),
      type: 'a',
      beat: 30,
      buff: 'unknown',
      lane: 2,
      index: 0,
      fail: false,
      activated: [],
    },
  ]
  const { result } = simulate(
    mockLive({ a: [[10], [], [5, 30], [], []] }),
    [
      mockIdol({
        preset: 'a_p_p',
        a1: mockAbility({ type: 'ct-reduction', target: 'center', amount: 5 }),
      }),
      null,
      mockIdol({ preset: 'a_p_p' }),
      null,
      null,
    ],
    mockLane()
  )
  expect(result).toStrictEqual(expected)
})

test('AスキルによるCT減少してもなおCT中のAスキル発動は失敗する', () => {
  const expected: Result = [
    {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      id: expect.any(String),
      type: 'a',
      beat: 5,
      buff: 'unknown',
      lane: 2,
      index: 0,
      fail: false,
      activated: [],
    },
    {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      id: expect.any(String),
      type: 'a',
      beat: 10,
      buff: 'ct-reduction',
      lane: 0,
      index: 0,
      fail: false,
      activated: [],
    },
    {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      id: expect.any(String),
      type: 'a',
      beat: 30,
      buff: 'unknown',
      lane: 2,
      index: undefined,
      fail: true,
      activated: [],
    },
  ]
  const { result } = simulate(
    mockLive({ a: [[10], [], [5, 30], [], []] }),
    [
      mockIdol({
        preset: 'a_p_p',
        a1: mockAbility({ type: 'ct-reduction', target: 'center', amount: 4 }),
      }),
      null,
      mockIdol({ preset: 'a_p_p' }),
      null,
      null,
    ],
    mockLane()
  )
  expect(result).toStrictEqual(expected)
})

test('AスキルによるCT減少によってPスキル発動が早まる', () => {
  const expected: Result = [
    {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      id: expect.any(String),
      type: 'p',
      beat: 0,
      buff: 'unknown',
      lane: 2,
      index: 1,
    },
    {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      id: expect.any(String),
      type: 'a',
      beat: 10,
      buff: 'ct-reduction',
      lane: 0,
      index: 0,
      fail: false,
      activated: [],
    },
    {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      id: expect.any(String),
      type: 'p',
      beat: 40,
      buff: 'unknown',
      lane: 2,
      index: 1,
    },
  ]
  const { result } = simulate(
    mockLive({ a: [[10], [], [], [], []], beat: 60 }),
    [
      mockIdol({
        preset: 'a_p_p',
        a1: mockAbility({ type: 'ct-reduction', target: 'center', amount: 10 }),
      }),
      null,
      mockIdol({ preset: 'a_p_p', p1Trigger: { type: 'none' } }),
      null,
      null,
    ],
    mockLane()
  )
  expect(result).toStrictEqual(expected)
})

test('PスキルによるCT減少によってCT間隔未満のAスキル発動が成功する', () => {
  const expected: Result = [
    {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      id: expect.any(String),
      type: 'a',
      beat: 5,
      buff: 'unknown',
      lane: 2,
      index: 0,
      fail: false,
      activated: [],
    },
    {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      id: expect.any(String),
      type: 'p',
      beat: 10,
      buff: 'ct-reduction',
      lane: 0,
      index: 1,
    },
    {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      id: expect.any(String),
      type: 'a',
      beat: 30,
      buff: 'unknown',
      lane: 2,
      index: 0,
      fail: false,
      activated: [],
    },
  ]
  const { result } = simulate(
    mockLive({ a: [[], [], [5, 30], [], []] }),
    [
      mockIdol({
        preset: 'a_p_p',
        p1: mockAbility({ type: 'ct-reduction', target: 'center', amount: 10 }),
        p1Trigger: { type: 'combo', amount: 10 },
      }),
      null,
      mockIdol({ preset: 'a_p_p' }),
      null,
      null,
    ],
    mockLane()
  )
  expect(result).toStrictEqual(expected)
})

test('PスキルによるCT減少によってPスキル発動が早まる', () => {
  const expected: Result = [
    {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      id: expect.any(String),
      type: 'p',
      beat: 0,
      buff: 'unknown',
      lane: 2,
      index: 1,
    },
    {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      id: expect.any(String),
      type: 'p',
      beat: 10,
      buff: 'ct-reduction',
      lane: 0,
      index: 1,
    },
    {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      id: expect.any(String),
      type: 'p',
      beat: 40,
      buff: 'unknown',
      lane: 2,
      index: 1,
    },
  ]
  const { result } = simulate(
    mockLive({ beat: 55 }),
    [
      mockIdol({
        preset: 'a_p_p',
        p1: mockAbility({ type: 'ct-reduction', target: 'center', amount: 10 }),
        p1Trigger: { type: 'combo', amount: 10 },
      }),
      null,
      mockIdol({ preset: 'a_p_p', p1Trigger: { type: 'none' } }),
      null,
      null,
    ],
    mockLane()
  )
  expect(result).toStrictEqual(expected)
})

test('PスキルによるCT減少によってそのPスキル自体のCTは短くならない', () => {
  const expected: Result = [
    {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      id: expect.any(String),
      type: 'p',
      beat: 10,
      buff: 'ct-reduction',
      lane: 0,
      index: 1,
    },
    {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      id: expect.any(String),
      type: 'p',
      beat: 60,
      buff: 'ct-reduction',
      lane: 0,
      index: 1,
    },
  ]
  const { result } = simulate(
    mockLive({ beat: 70 }),
    [
      mockIdol({
        preset: 'a_p_p',
        p1: mockAbility({ type: 'ct-reduction', target: 'center', amount: 10 }),
        p1Trigger: { type: 'combo', amount: 10 },
      }),
      null,
      null,
      null,
      null,
    ],
    mockLane()
  )
  expect(result).toStrictEqual(expected)
})

test('PスキルによるCT減少によって同ビートで発動しているPスキルのCTは短くならない', () => {
  const expected: Result = [
    {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      id: expect.any(String),
      type: 'p',
      beat: 10,
      buff: 'ct-reduction',
      lane: 0,
      index: 1,
    },
    {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      id: expect.any(String),
      type: 'p',
      beat: 10,
      buff: 'unknown',
      lane: 1,
      index: 1,
    },
    {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      id: expect.any(String),
      type: 'p',
      beat: 60,
      buff: 'ct-reduction',
      lane: 0,
      index: 1,
    },
    {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      id: expect.any(String),
      type: 'p',
      beat: 60,
      buff: 'unknown',
      lane: 1,
      index: 1,
    },
  ]
  const { result } = simulate(
    mockLive({ beat: 70 }),
    [
      mockIdol({
        preset: 'a_p_p',
        p1: mockAbility({ type: 'ct-reduction', target: 'center', amount: 10 }),
        p1Trigger: { type: 'combo', amount: 10 },
      }),
      mockIdol({
        preset: 'a_p_p',
        p1Trigger: { type: 'combo', amount: 10 },
      }),
      null,
      null,
      null,
    ],
    mockLane()
  )
  expect(result).toStrictEqual(expected)
})

test('SPシフトがAスキル起因で発動する', () => {
  const expected: Result = [
    {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      id: expect.any(String),
      type: 'a',
      beat: 1,
      buff: 'dance',
      lane: 2,
      index: 1,
      fail: false,
      activated: [{ type: 'dance', amount: 4 }],
    },
    {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      id: expect.any(String),
      type: 'buff',
      beat: 1,
      buff: 'dance',
      lane: 2,
      affected: true,
      amount: 4,
      span: 4,
    },
    {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      id: expect.any(String),
      type: 'a',
      beat: 5,
      buff: 'shift-before-sp',
      lane: 0,
      index: 0,
      fail: false,
      activated: [],
    },
    {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      id: expect.any(String),
      type: 'sp',
      beat: 20,
      buff: 'unknown',
      lane: 2,
      index: 0,
      fail: false,
      activated: [{ type: 'dance', amount: 4 }],
    },
    {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      id: expect.any(String),
      type: 'buff',
      beat: 20,
      buff: 'dance',
      lane: 2,
      affected: true,
      amount: 4,
      span: 6,
    },
  ]
  expect(
    simulate(
      mockLive({ a: [[5], [], [1], [], []], sp: [[], [], [20], [], []], beat: 50 }),
      [
        mockIdol({
          preset: 'a_p_p',
          a1: mockAbility({ type: 'shift-before-sp', target: 'center' }),
        }),
        null,
        mockIdol({
          preset: 'sp_a_a',
          a1: mockAbility({ type: 'dance', target: 'self' }),
        }),
        null,
        null,
      ],
      mockLane()
    ).result
  ).toStrictEqual(expected)
})

test('SPシフトがPスキル起因で発動する', () => {
  const expected: Result = [
    {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      id: expect.any(String),
      type: 'a',
      beat: 5,
      buff: 'tension',
      lane: 0,
      index: 0,
      fail: false,
      activated: [],
    },
    {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      id: expect.any(String),
      type: 'buff',
      beat: 5,
      buff: 'tension',
      lane: 2,
      affected: false,
      amount: 4,
      span: 0,
    },
    {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      id: expect.any(String),
      type: 'p',
      beat: 5,
      buff: 'shift-before-sp',
      lane: 0,
      index: 1,
    },
    {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      id: expect.any(String),
      type: 'sp',
      beat: 20,
      buff: 'unknown',
      lane: 2,
      index: 0,
      fail: false,
      activated: [{ type: 'tension', amount: 4 }],
    },
    {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      id: expect.any(String),
      type: 'buff',
      beat: 20,
      buff: 'tension',
      lane: 2,
      affected: true,
      amount: 4,
      span: 10,
    },
  ]
  expect(
    simulate(
      mockLive({ a: [[5], [], [], [], []], sp: [[], [], [20], [], []], beat: 50 }),
      [
        mockIdol({
          preset: 'a_p_p',
          a1: mockAbility({ type: 'tension', target: 'center' }),
          p1: mockAbility({ type: 'shift-before-sp', target: 'center' }),
          p1Trigger: { type: 'anyone-tension-up' },
        }),
        null,
        mockIdol({
          preset: 'sp_a_a',
        }),
        null,
        null,
      ],
      mockLane()
    ).result
  ).toStrictEqual(expected)
})

test('SPシフトで移動したバフがライブの終端で終わる', () => {
  const expected: Result = [
    {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      id: expect.any(String),
      type: 'a',
      beat: 1,
      buff: 'dance',
      lane: 2,
      index: 1,
      fail: false,
      activated: [{ type: 'dance', amount: 4 }],
    },
    {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      id: expect.any(String),
      type: 'buff',
      beat: 1,
      buff: 'dance',
      lane: 2,
      affected: true,
      amount: 4,
      span: 4,
    },
    {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      id: expect.any(String),
      type: 'a',
      beat: 5,
      buff: 'shift-before-sp',
      lane: 0,
      index: 0,
      fail: false,
      activated: [],
    },
    {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      id: expect.any(String),
      type: 'sp',
      beat: 20,
      buff: 'unknown',
      lane: 2,
      index: 0,
      fail: false,
      activated: [{ type: 'dance', amount: 4 }],
    },
    {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      id: expect.any(String),
      type: 'buff',
      beat: 20,
      buff: 'dance',
      lane: 2,
      affected: true,
      amount: 4,
      span: 11,
    },
  ]
  expect(
    simulate(
      mockLive({ a: [[5], [], [1], [], []], sp: [[], [], [20], [], []], beat: 30 }),
      [
        mockIdol({
          preset: 'a_p_p',
          a1: mockAbility({ type: 'shift-before-sp', target: 'center' }),
        }),
        null,
        mockIdol({
          preset: 'sp_a_a',
          a1: mockAbility({ type: 'dance', target: 'self', span: 30 }),
        }),
        null,
        null,
      ],
      mockLane()
    ).result
  ).toStrictEqual(expected)
})

test('ダンスレーンの時の条件が満たされる効果のみ適用される', () => {
  const expected: Result = [
    {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      id: expect.any(String),
      type: 'p',
      beat: 0,
      buff: 'score',
      lane: 0,
      index: 1,
    },
    {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      id: expect.any(String),
      type: 'p',
      beat: 0,
      buff: 'score',
      lane: 1,
      index: 1,
    },
    {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      id: expect.any(String),
      type: 'buff',
      beat: 0,
      buff: 'score',
      lane: 0,
      affected: false,
      amount: 4,
      span: 10,
    },
  ]
  expect(
    simulate(
      mockLive({ beat: 20 }),
      [
        mockIdol({
          preset: 'a_p_p',
          p1: mockAbility({ type: 'score', target: 'self', condition: { type: 'in-dance-lane' } }),
          p1Trigger: { type: 'none' },
        }),
        mockIdol({
          preset: 'a_p_p',
          p1: mockAbility({ type: 'score', target: 'self', condition: { type: 'in-dance-lane' } }),
          p1Trigger: { type: 'none' },
        }),
        null,
        null,
        null,
      ],
      mockLane({ type: ['dance', 'visual', null, null, null] })
    ).result
  ).toStrictEqual(expected)
})

test('ダンスレーンの時の条件が満たされる効果のみ適用される (CT減などミューテーション系)', () => {
  const expected: Result = [
    {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      id: expect.any(String),
      type: 'p',
      beat: 0,
      buff: 'unknown',
      lane: 2,
      index: 1,
    },
    {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      id: expect.any(String),
      type: 'p',
      beat: 5,
      buff: 'ct-reduction',
      lane: 0,
      index: 1,
    },
    {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      id: expect.any(String),
      type: 'p',
      beat: 10,
      buff: 'ct-reduction',
      lane: 1,
      index: 1,
    },
    {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      id: expect.any(String),
      type: 'p',
      beat: 20,
      buff: 'unknown',
      lane: 2,
      index: 1,
    },
  ]
  expect(
    simulate(
      mockLive({ beat: 40 }),
      [
        mockIdol({
          preset: 'a_p_p',
          p1: mockAbility({ type: 'ct-reduction', amount: 30, target: 'center', condition: { type: 'in-dance-lane' } }),
          p1Trigger: { type: 'combo', amount: 5 },
        }),
        mockIdol({
          preset: 'a_p_p',
          p1: mockAbility({ type: 'ct-reduction', amount: 5, target: 'center', condition: { type: 'in-dance-lane' } }),
          p1Trigger: { type: 'combo', amount: 10 },
        }),
        mockIdol({
          preset: 'a_p_p',
          p1: mockAbility({ type: 'get-score' }),
          p1Trigger: { type: 'none' },
        }),
        null,
        null,
      ],
      mockLane({ type: ['dance', 'visual', null, null, null] })
    ).result
  ).toStrictEqual(expected)
})
