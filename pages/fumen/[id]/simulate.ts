import { LiveData } from '~/data/live'
import { Idol, Skill } from '~/data/idol'
import isNonNullable from 'is-non-nullable'

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

export function simulate(live: LiveData, idol: Idol[]) {
  const BEATS = new Array(live.beat).fill(0).map((_, i) => i)
  return BEATS.reduce(
    ({ result, state }, currentBeat) => {
      // Aスキルの発動チェック
      const aState: State = live.a
        .map((laneData, lane) => {
          // いまのビートがAのタイミングかどうかをチェック
          const skillTiming = laneData.find((beat) => beat === currentBeat)
          if (skillTiming === undefined) {
            return null
          }
          // アイドルが発動可能なAスキルを持っているかをチェック
          // アイドルの過去に発動したAスキルのうちCT中のもの
          const aSkillsCT = state
            .map((v) => (v.skill === null ? null : { ...v, skill: v.skill }))
            .filter(isNonNullable)
            .filter((v) => v.lane === lane && v.skill?.type === 'a' && v.beat + v.skill.ct >= currentBeat)
          // 発動可能なAスキルを絞り込む
          const aSkillCanTrigger = idol[lane].skills
            .filter((skill) => !aSkillsCT.map((v) => v.skill.index).includes(skill.index))
            .filter((v) => v.type === 'a')
          const aSkillHead = aSkillCanTrigger.length > 0 ? aSkillCanTrigger[0] : null
          return { lane, beat: currentBeat, skill: aSkillHead }
        })
        .filter(isNonNullable)
      const aResult: Result = aState.map(({ lane, skill }) => ({
        type: 'a' as const,
        beat: currentBeat,
        lane: lane,
        fail: skill === null,
      }))

      // Aスキルによるバフ
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const aBuffResult: Result = aState
        .flatMap(({ lane, skill }) => {
          // nullのときはスキル失敗なので、バフの計算はしない
          if (skill === null) {
            return []
          }
          return skill.ability
            .map((ability) => {
              if (ability.type !== 'buff') {
                return null
              }
              const lanes = ability.target === 'all' ? [0, 1, 2, 3, 4] : ability.target === 'self' ? [lane] : []
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
      const spState: State = live.sp
        .map((laneData, lane) => {
          // いまのビートがSPのタイミングかどうかをチェック
          const skillTiming = laneData.find((beat) => beat === currentBeat)
          if (skillTiming === undefined) {
            return null
          }
          // アイドルがSPを持っているかどうかをチェック
          const skill = idol[lane].skills.find((skill) => skill.type === 'sp')
          if (skill === undefined) {
            return { lane, beat: currentBeat, skill: null }
          }
          return { lane, beat: currentBeat, skill }
        })
        .filter(isNonNullable)
      const spResult: Result = spState.map(({ lane, skill }) => ({
        type: 'sp' as const,
        beat: currentBeat,
        lane: lane,
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
