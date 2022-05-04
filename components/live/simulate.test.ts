import { Result, simulate } from './simulate'
import { AbilityData, IdolData, LiveData } from '~~/utils/types'
import { unreachable } from '~~/utils'

const mockLive = ({ sp, a }: { sp?: LiveData['sp']; a?: LiveData['a'] }): LiveData => ({
  id: 'mock',
  title: 'MOCK',
  sp: sp ?? [[], [], [], [], []],
  a: a ?? [[], [], [], [], []],
  beat: Math.max(...[...(sp?.flat() ?? []), ...(a?.flat() ?? []), 0]),
  unit: 'UNIT',
})

const mockIdol = ({
  type,
  role,
  skills,
  preset,
}: Partial<Pick<IdolData, 'role' | 'type' | 'skills'>> & { preset?: 'sp_a_a'; a1?: AbilityData }): IdolData => {
  const presetSkills: IdolData['skills'] =
    preset === 'sp_a_a' || preset === undefined
      ? [
          { id: 'skill_1', index: 0, type: 'sp', level: 1, name: 'SP SKILL', ability: [] },
          { id: 'skill_2', index: 1, type: 'a', level: 1, name: 'A SKILL 1', ability: [], ct: 50 },
          { id: 'skill_2', index: 2, type: 'a', level: 1, name: 'A SKILL 2', ability: [], ct: 50 },
        ]
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

// const mockAbility = (): AbilityData => ({
//   div: 'score',
//   amount: 1000,
//   condition: {
//     type: 'none',
//   },
//   enhance: {
//     type: 'none',
//   },
//   id: 'mock_ability',
// })

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
      beat: 1,
      buff: 'unknown',
      lane: 0,
      type: 'a',
      index: 1,
      fail: false,
      activated: [],
    },
  ]
  expect(
    simulate(
      mockLive({
        a: [[1], [], [], [], []],
      }),
      [mockIdol({ preset: 'sp_a_a' }), null, null, null, null]
    ).result
  ).toStrictEqual(expected)
})
