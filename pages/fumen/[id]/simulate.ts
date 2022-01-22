import { Lane, LiveData } from '~/data/live'
import { BuffTarget, Idol, Skill } from '~/data/idol'
import isNonNullable from 'is-non-nullable'
import { ArrayN, indexed, unreachable } from '~~/utils'

type Result = ({
  beat: number
} & (
  | {
      type: 'p'
      lane: Lane
    }
  | {
      type: 'sp' | 'a'
      lane: Lane
      fail: boolean
    }
  | {
      type: 'buff'
      lanes: Lane[]
      span: number
    }
))[]

// 発生したスキルを記録する
type State = {
  lane: number // スキルが発生したレーン
  beat: number // スキルが発生したビート
  skill: Skill | null // アイドルのスキル, nullのときは失敗
}[]

export function simulate(live: LiveData, idols: ArrayN<Idol, 5>) {
  const BEATS = new Array(live.beat).fill(0).map((_, i) => i)
  return BEATS.reduce(
    ({ result, state }, currentBeat) => {
      // CT中のスキルを絞り込む
      const ctState = state
        // 失敗したスキルはCT中ではないので除く
        .map((v) => (v.skill === null ? null : { ...v, skill: v.skill }))
        .filter(isNonNullable)
        // 対象レーンのスキル発動のログのうちCT中のスキルのみを抽出
        .filter((v) => v.skill.type !== 'sp' && v.beat + v.skill.ct >= currentBeat)

      // Aスキルの発動チェック
      const aState = indexed(live.a)
        .map(([laneData, lane]) => {
          // いまのビートがAのタイミングかどうかをチェック
          const skillTiming = laneData.find((beat) => beat === currentBeat)
          if (skillTiming === undefined) {
            return null
          }
          // アイドルが発動可能なAスキルを持っているかをチェック
          const ctSkills = ctState
            .filter((v) => v.lane === lane)
            .map((v) => v.skill)
            .filter(isType('a'))
          // 発動可能なAスキルを絞り込む
          const canTriggerSkills = idols[lane].skills
            .filter(isType('a'))
            // CT中に含まれていない保持スキルを絞り込む
            .filter((skill) => !ctSkills.map((v) => v.index).includes(skill.index))
          return { lane, beat: currentBeat, skill: canTriggerSkills[0] ?? null }
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
              const lanes = deriveBuffLanes(ability.target, lane, idols)
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
      const spState = indexed(live.sp)
        .map(([laneData, lane]) => {
          // いまのビートがSPのタイミングかどうかをチェック
          const skillTiming = laneData.find((beat) => beat === currentBeat)
          if (skillTiming === undefined) {
            return null
          }
          // アイドルがSPを持っているかどうかをチェック
          const skill = idols[lane].skills.find(isType('sp'))
          if (skill === undefined) {
            return { lane, beat: currentBeat, skill: null }
          }
          return { lane, beat: currentBeat, skill }
        })
        .filter(isNonNullable)
      const spResult = spState.map(({ lane, skill }) => ({
        type: 'sp' as const,
        beat: currentBeat,
        lane,
        fail: skill === null,
      }))

      // Pスキルの発動チェック
      const pState = indexed(idols).flatMap(([idol, lane]) => {
        const ctSkills = ctState
          .filter((v) => v.lane === lane)
          .map((v) => v.skill)
          .filter(isType('p'))
        const canTriggerSkills = idol.skills
          .filter(isType('p'))
          .filter((skill) => !ctSkills.map((v) => v.index).includes(skill.index))
        return canTriggerSkills
          .map((skill) => {
            switch (skill.trigger.type) {
              case 'idle':
                return { lane, beat: currentBeat, skill }
              case 'sp': {
                const spLane = spResult.find((v) => !v.fail)?.lane
                return spLane === undefined ? null : { lane, beat: currentBeat, skill }
              }
              case 'critical':
                return null
              case 'combo':
                return null
            }
          })
          .filter(isNonNullable)
      })
      const pResult = pState.map(({ lane }) => ({
        type: 'p' as const,
        beat: currentBeat,
        lane,
      }))

      return {
        result: [...result, ...aResult, ...aBuffResult, ...spResult, ...pResult],
        state: [...state, ...aState, ...spState, ...pState],
      }
    },
    { result: [] as Result, state: [] as State }
  )
}

function deriveBuffLanes(target: BuffTarget, selfLane: Lane, idol: ArrayN<Idol, 5>): Lane[] {
  switch (target) {
    case 'all':
      return [0, 1, 2, 3, 4]
    case 'self':
      return [selfLane]
    case '1-scorer': {
      const candidate = indexed(idol)
        .filter(([v]) => v.role === 'scorer')
        .map(second)
        .sort(comparebyCenter)
      return [candidate[0]].filter(isNonNullable)
    }
    case '2-scorers': {
      const candidate = indexed(idol)
        .filter(([v]) => v.role === 'scorer')
        .map(second)
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

function second<T>([, value]: readonly [unknown, T]) {
  return value
}

function comparebyCenter(a: number, b: number) {
  return Math.abs(2.1 - a) - Math.abs(2.1 - b)
}
