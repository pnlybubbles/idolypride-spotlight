import { simulate } from './simulate'
import { LiveData } from '~~/utils/types'

const mockLive = ({ sp, a }: { sp?: LiveData['sp']; a?: LiveData['a'] }): LiveData => ({
  id: 'mock',
  title: 'MOCK',
  sp: sp ?? [[], [], [], [], []],
  a: a ?? [[], [], [], [], []],
  beat: Math.max(...[...(sp?.flat() ?? []), ...(a?.flat() ?? []), 0]),
  unit: 'UNIT',
})

test('単純なサンプル', () => {
  expect(simulate(mockLive({}), [null, null, null, null, null])).toStrictEqual({
    result: [],
    state: [],
  })
})
