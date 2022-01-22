import { LiveData } from '~/data/live'
import { BuffTarget, Idol, Skill } from '~/data/idol'
import isNonNullable from 'is-non-nullable'
import { ArrayN, indexed, unreachable } from '~~/utils'

type Result = ({
  beat: number
} & (
  | {
      type: 'sp' | 'a' | 'p'
      lane: number
      fail: boolean
    }
  | {
      type: 'buff'
      lanes: number[]
      span: number
    }
))[]

// 発生したスキルを記録する
type State = {
  lane: number // スキルが発生したレーン
  beat: number // スキルが発生したビート
  skill: Skill | null // アイドルのスキル, nullのときは失敗
}[]

export function simulate(live: LiveData, idol: ArrayN<Idol, 5>) {
  const BEATS = new Array(live.beat).fill(0).map((_, i) => i)
  return BEATS.reduce(
    ({ result, state }, currentBeat) => {
      // Aスキルの発動チェック
      const aState = indexed(live.a)
        .map(([laneData, lane]) => {
          // いまのビートがAのタイミングかどうかをチェック
          const skillTiming = laneData.find((beat) => beat === currentBeat)
          if (skillTiming === undefined) {
            return null
          }
          // アイドルが発動可能なAスキルを持っているかをチェック
          // アイドルの過去に発動したAスキルのうちCT中のもの
          const aSkillsCT = state
            // スキル失敗をフィルタ
            .map((v) => (v.skill === null ? null : { ...v, skill: v.skill }))
            .filter(isNonNullable)
            // 対象レーンのaスキル発動のログのうちCT中のスキルのみを抽出
            .filter((v) => v.lane === lane && v.skill.type === 'a' && v.beat + v.skill.ct >= currentBeat)
          // 発動可能なAスキルを絞り込む
          const aSkillCanTrigger = idol[lane].skills
            .filter(isType('a'))
            // CT中に含まれていない保持スキルを絞り込む
            .filter((skill) => !aSkillsCT.map((v) => v.skill.index).includes(skill.index))
          return { lane, beat: currentBeat, skill: aSkillCanTrigger[0] ?? null }
        })
        .filter(isNonNullable)
      const aResult: Result = aState.map(({ lane, skill }) => ({
        type: 'a' as const,
        beat: currentBeat,
        lane,
        fail: skill === null,
      }))

      // Aスキルによるバフ
      const aBuffResult: Result = aState
        .flatMap(({ lane, skill }) => {
          // nullのときはスキル失敗なので、バフの計算はしない
          if (skill === null) {
            return []
          }
          return skill.ability
            .filter(isType('buff'))
            .map((ability) => {
              const lanes = deriveBuffLanes(ability.target, lane, idol)
              return {
                type: 'buff' as const,
                beat: currentBeat,
                lanes: lanes,
                span: ability.span,
              }
            })
            .filter(isNonNullable)
        })
        .filter(isNonNullable)

      // SPスキルの発動チェック
      const spState: State = indexed(live.sp)
        .map(([laneData, lane]) => {
          // いまのビートがSPのタイミングかどうかをチェック
          const skillTiming = laneData.find((beat) => beat === currentBeat)
          if (skillTiming === undefined) {
            return null
          }
          // アイドルがSPを持っているかどうかをチェック
          const skill = idol[lane].skills.find(isType('sp'))
          if (skill === undefined) {
            return { lane, beat: currentBeat, skill: null }
          }
          return { lane, beat: currentBeat, skill }
        })
        .filter(isNonNullable)
      const spResult: Result = spState.map(({ lane, skill }) => ({
        type: 'sp' as const,
        beat: currentBeat,
        lane,
        fail: skill === null,
      }))

      return {
        result: [...result, ...aResult, ...aBuffResult, ...spResult],
        state: [...state, ...aState, ...spState],
      }
    },
    { result: [] as Result, state: [] as State }
  )
}

function deriveBuffLanes(target: BuffTarget, selfLane: number, idol: ArrayN<Idol, 5>) {
  switch (target) {
    case 'all':
      return [0, 1, 2, 3, 4]
    case 'self':
      return [selfLane]
    case '1-scorer': {
      const candidate = idol
        .map(enumerate)
        .filter(([v]) => v.role === 'scorer')
        .map(toIndex)
        .sort(comparebyCenter)
      return [candidate[0]].filter(isNonNullable)
    }
    case '2-scorers': {
      const candidate = idol
        .map(enumerate)
        .filter(([v]) => v.role === 'scorer')
        .map(toIndex)
        .sort(comparebyCenter)
      return [candidate[0], candidate[1]].filter(isNonNullable)
    }
    default:
      unreachable(target)
  }
}

function isType<Type extends string>(type: Type) {
  return <Value extends { type: string }>(value: Value): value is Extract<Value, { type: Type }> => value.type === type
}

function enumerate<T>(value: T, index: number) {
  return [value, index] as const
}

function toIndex([, index]: readonly [unknown, number]) {
  return index
}

function comparebyCenter(a: number, b: number) {
  return Math.abs(2.1 - a) - Math.abs(2.1 - b)
}
