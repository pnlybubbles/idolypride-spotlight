import { Result, simulate } from './simulate'
import {
  AbilityCondition,
  AbilityData,
  AbilityType,
  IdolData,
  LiveData,
  PassiveBuffTarget,
  SkillData,
  SkillType,
} from '~~/utils/types'
import { unreachable } from '~~/utils'
import { isActionAbilityType, isBuffAbilityType } from '~~/utils/formatter'

const mockLive = ({ sp, a }: { sp?: LiveData['sp']; a?: LiveData['a'] }): LiveData => ({
  id: 'mock',
  title: 'MOCK',
  sp: sp ?? [[], [], [], [], []],
  a: a ?? [[], [], [], [], []],
  beat: Math.max(...[...(sp?.flat() ?? []), ...(a?.flat() ?? []), 1]),
  unit: 'UNIT',
})

const mockIdol = ({
  type,
  role,
  skills,
  preset,
  a1,
  p1,
}: Partial<Pick<IdolData, 'role' | 'type' | 'skills'>> & {
  preset?: 'sp_a_a' | 'a_p_p'
  a1?: AbilityData
  p1?: AbilityData
}): IdolData => {
  const presetSkills: IdolData['skills'] =
    preset === 'sp_a_a' || preset === undefined
      ? [mockSkill(0, 'sp', []), mockSkill(1, 'a', a1 ? [a1] : [], 50), mockSkill(2, 'a', [], 50)]
      : preset === 'a_p_p'
      ? [mockSkill(0, 'a', a1 ? [a1] : [], 30), mockSkill(1, 'p', p1 ? [p1] : [], 50), mockSkill(2, 'p', [], 50)]
      : unreachable(preset)
  return {
    id: 'nagisa',
    name: '伊吹渚',
    title: 'mock_title',
    role: role ?? 'scorer',
    type: type ?? 'vocal',
    userId: 'mock_user',
    skills: skills ?? presetSkills,
  }
}

const mockSkill = (index: 0 | 1 | 2, type: SkillType, ability: AbilityData[], ct?: number): SkillData => ({
  id: `skill_${index}`,
  index,
  level: 1,
  name: `${type.toUpperCase()} SKILL`,
  ability,
  ...(type === 'sp'
    ? { type }
    : {
        type,
        ct: ct ?? 30,
      }),
})

const mockAbility = ({
  type,
  condition,
  span,
  target,
}: {
  condition?: AbilityCondition
  span?: number
  target?: PassiveBuffTarget
  type: AbilityType | 'score'
}): AbilityData =>
  type === 'score'
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
        amount: 4,
        target: target === 'triggered' || target === undefined ? 'all' : target,
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
        amount: 7,
        target: target === 'triggered' || target === undefined ? 'all' : target,
        type,
        condition: condition ?? {
          type: 'none',
        },
        id: 'mock_ability',
      }
    : unreachable(type)

test('単純なサンプル', () => {
  expect(simulate(mockLive({}), [null, null, null, null, null])).toStrictEqual({
    result: [],
    state: [],
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
      index: 1,
      fail: false,
      activated: [],
    },
  ]
  expect(
    simulate(mockLive({ a: [[1], [], [], [], []] }), [mockIdol({ preset: 'sp_a_a' }), null, null, null, null]).result
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
    simulate(mockLive({ sp: [[1], [], [], [], []] }), [mockIdol({ preset: 'sp_a_a' }), null, null, null, null]).result
  ).toStrictEqual(expected)
})

test('Pスキルが発動する', () => {
  const expected: Result = [
    {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      id: expect.any(String),
      type: 'p',
      beat: 1,
      buff: 'vocal',
      lane: 0,
      index: 1,
    },
    {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      id: expect.any(String),
      type: 'buff',
      beat: 1,
      buff: 'vocal',
      lane: 0,
      affected: false,
      amount: 4,
      span: 1,
    },
  ]
  expect(
    simulate(mockLive({}), [
      mockIdol({ preset: 'a_p_p', p1: mockAbility({ type: 'vocal', target: 'self' }) }),
      null,
      null,
      null,
      null,
    ]).result
  ).toStrictEqual(expected)
})
