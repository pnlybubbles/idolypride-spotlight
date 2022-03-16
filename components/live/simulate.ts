import { BuffTarget, AbilityType, Lane, LiveData, SkillData, IdolData } from '~/utils/types'
import isNonNullable from 'is-non-nullable'
import { ArrayN, indexed, uid, unreachable } from '~~/utils'

type Result = ({
  id: string
  beat: number
  // 色付けに使うバフID
  buff: AbilityType
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
      lane: Lane
      span: number
      affected: boolean
    }
))[]

// 発生したスキルを記録する
type State = ({
  lane: Lane // スキルが発生したレーン
  beat: number // スキルが発生したビート
} & (
  | {
      type: 'sp'
      skill: Extract<SkillData, { type: 'sp' }> | null // 発動したスキル, nullのときは失敗
    }
  | {
      type: 'a'
      skill: Extract<SkillData, { type: 'a' }> | null // 発動したスキル, nullのときは失敗
    }
  | {
      type: 'p'
      skill: Extract<SkillData, { type: 'p' }> // 発動したスキル
    }
))[]

export function simulate(live: LiveData, idols: ArrayN<IdolData | null, 5>) {
  const BEATS = new Array(live.beat).fill(0).map((_, i) => i + 1)
  return BEATS.reduce(
    ({ result, state }, currentBeat) => {
      const appendBeat = <T>(v: T) => ({ ...v, beat: currentBeat })
      const appendAffected = <T>(v: T) => ({ ...v, affected: false })
      const appendId = <T>(v: T) => ({ ...v, id: uid() })
      const inCT = (beat: number, ct: number) => beat + ct >= currentBeat
      const clampSpan = (span: number, liveBeat: number) => Math.min(span, liveBeat - currentBeat + 1)

      // CT中のスキルを絞り込む
      const ctState = state
        // 対象レーンのスキル発動のログのうちCT中のスキルのみを抽出
        // SP以外かつ、スキルが失敗していないかつ、発動時からCTが経っていないもの
        .map((v) => {
          // SPスキルにはCTは無い
          if (v.type === 'sp') {
            return null
          }
          // Aスキル
          if (v.type === 'a') {
            // 失敗しているスキルはそもそも発動していないのでCTに影響しない
            if (v.skill === null) {
              return null
            }
            // CTチェック
            if (!inCT(v.beat, v.skill.ct)) {
              return null
            }
            return { ...v, skill: v.skill }
          }
          // Pスキル
          if (v.type === 'p') {
            // CTチェック
            if (!inCT(v.beat, v.skill.ct)) {
              return null
            }
            return v
          }
          return unreachable(v)
        })
        .filter(isNonNullable)

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
            .filter(isType('a'))
            .map((v) => v.skill)
          // 発動可能なAスキルを絞り込む
          const canTriggerSkills = idols[lane]?.skills
            .filter(isType('a'))
            // CT中に含まれていない保持スキルを絞り込む
            .filter((skill) => !ctSkills.map((v) => v.index).includes(skill.index))
          return { lane, skill: canTriggerSkills?.[0] ?? null }
        })
        .filter(isNonNullable)
        .map(appendBeat)
        .map(appendType('a'))

      if (!true) {
        const _: State = aState
        _
      }

      const aResult = aState
        .map(({ lane, skill }) => ({
          type: 'a' as const,
          buff: skill?.ability.map((v) => (v.div === 'buff' ? v : null)).filter(isNonNullable)[0]?.type ?? 'unknown',
          lane,
          fail: skill === null,
        }))
        .map(appendBeat)
        .map(appendId)

      if (!true) {
        const _: Result = aResult
        _
      }

      // Aスキルによるバフ
      const aBuffResult = aState
        .flatMap(({ lane, skill }) => {
          // nullのときはスキル失敗なので、バフの計算はしない
          if (skill === null) {
            return []
          }
          return skill.ability
            .filter(isDiv('buff'))
            .flatMap((ability) => {
              const lanes = deriveBuffLanes(ability.target, lane, idols)
              return lanes.map((lane) => ({
                type: 'buff' as const,
                buff: ability.type,
                lane,
                span: clampSpan(ability.span, live.beat),
              }))
            })
            .filter(isNonNullable)
        })
        .filter(isNonNullable)
        .map(appendBeat)
        .map(appendAffected)
        .map(appendId)

      if (!true) {
        const _: Result = aBuffResult
        _
      }

      // SPスキルの発動チェック
      const spState = indexed(live.sp)
        .map(([laneData, lane]) => {
          // いまのビートがSPのタイミングかどうかをチェック
          const skillTiming = laneData.find((beat) => beat === currentBeat)
          if (skillTiming === undefined) {
            return null
          }
          // アイドルがSPを持っているかどうかをチェック
          const skill = idols[lane]?.skills.find(isType('sp'))
          if (skill === undefined) {
            return { lane, skill: null }
          }
          return { lane, skill }
        })
        .filter(isNonNullable)
        .map(appendBeat)
        .map(appendType('sp'))

      if (!true) {
        const _: State = spState
        _
      }

      const spResult = spState
        .map(({ lane, skill }) => ({
          type: 'sp' as const,
          buff: skill?.ability.map((v) => (v.div === 'buff' ? v : null)).filter(isNonNullable)[0]?.type ?? 'unknown',
          lane,
          fail: skill === null,
        }))
        .map(appendBeat)
        .map(appendId)

      if (!true) {
        const _: Result = spResult
        _
      }

      // SPスキルによるバフ
      const spBuffResult = spState
        .flatMap(({ lane, skill }) => {
          // nullのときはスキル失敗なので、バフの計算はしない
          if (skill === null) {
            return []
          }
          return skill.ability
            .filter(isDiv('buff'))
            .flatMap((ability) => {
              const lanes = deriveBuffLanes(ability.target, lane, idols)
              return lanes.map((lane) => ({
                type: 'buff' as const,
                buff: ability.type,
                lane,
                span: clampSpan(ability.span, live.beat),
              }))
            })
            .filter(isNonNullable)
        })
        .filter(isNonNullable)
        .map(appendBeat)
        .map(appendAffected)
        .map(appendId)

      if (!true) {
        const _: Result = spBuffResult
        _
      }

      // Pスキルの発動チェック
      const pState = indexed(idols)
        .flatMap(([idol, lane]) => {
          // CT中ではない発動可能なPスキルがあるかチェック
          const ctSkills = ctState
            .filter((v) => v.lane === lane)
            .map((v) => v.skill)
            .filter(isType('p'))
          const canTriggerSkills =
            idol?.skills.filter(isType('p')).filter((skill) => !ctSkills.map((v) => v.index).includes(skill.index)) ??
            []
          return canTriggerSkills
            .map((skill) => {
              switch (skill.trigger.type) {
                case 'idle':
                  // 無条件
                  return { triggeredLane: null, skill }
                case 'sp': {
                  // 誰かがSPスキルは発動時
                  const spLane = spResult.find((v) => !v.fail)?.lane
                  return spLane === undefined ? null : { triggeredLane: spLane, skill }
                }
                case 'a': {
                  // 誰かがAスキル発動時
                  const aLane = aResult.find((v) => !v.fail)?.lane
                  return aLane === undefined ? null : { triggeredLane: aLane, skill }
                }
                case 'critical':
                case 'beat':
                case 'a-score-up':
                case 'sp-score-up':
                case 'cmb-score-up':
                case 'score-up':
                case 'beat-score-up':
                case 'combo':
                case 'stamina-less-than':
                case 'anyone-tension-up':
                case 'unknown':
                  // TODO
                  return null
                default:
                  unreachable(skill.trigger)
              }
            })
            .filter(isNonNullable)
            .map((v) => ({ ...v, lane }))
        })
        .map(appendBeat)
        .map(appendType('p'))

      if (!true) {
        const _: State = pState
        _
      }

      const pResult = pState
        .map(({ lane, skill }) => ({
          type: 'p' as const,
          buff: skill.ability.map((v) => (v.div === 'buff' ? v : null)).filter(isNonNullable)[0]?.type ?? 'unknown',
          lane,
        }))
        .map(appendBeat)
        .map(appendId)

      if (!true) {
        const _: Result = pResult
        _
      }

      // Pスキルによるバフ
      const pBuffResult = pState
        .flatMap(({ lane, skill, triggeredLane }) => {
          return skill.ability
            .filter(isDiv('buff'))
            .flatMap((ability) => {
              const lanes =
                ability.target === 'triggered'
                  ? triggeredLane
                    ? [triggeredLane]
                    : []
                  : deriveBuffLanes(ability.target, lane, idols)
              return lanes.map((lane) => ({
                type: 'buff' as const,
                buff: ability.type,
                lane,
                span: clampSpan(ability.span, live.beat),
              }))
            })
            .filter(isNonNullable)
        })
        .filter(isNonNullable)
        .map(appendBeat)
        .map(appendAffected)
        .map(appendId)

      if (!true) {
        const _: Result = pBuffResult
        _
      }

      const tmpResult = [
        ...result,
        ...aResult,
        ...aBuffResult,
        ...spResult,
        ...spBuffResult,
        ...pResult,
        ...pBuffResult,
      ]

      // スコア獲得スキルにバフが効いているかをチェック
      // 注意:
      // - このビートで発動したSP,A,Pスキルでのバフはそのスキル自身のスコア獲得に影響を与える (Pは未検証)
      // - スコア獲得スキルを持たないSP,Aスキルは存在しない前提

      // 現在のバフを取得
      const availableBuffs = tmpResult.filter(isType('buff')).filter(
        (v) =>
          // スキルが発動したビートからバフがかかる
          // バフがかかる最後のビートは、発動ビート + 持続ビート数 - 1
          currentBeat >= v.beat && currentBeat <= v.beat + v.span - 1
      )
      // TODO: Pのスコア獲得スキル対応
      // スコア獲得スキルが発動したレーン
      const scoredLanes = [...aState, ...spState].map((v) => v.lane)
      const affectedBuffs = availableBuffs
        .filter((v) => scoredLanes.includes(v.lane))
        .map((v) => ({ ...v, affected: true }))

      const newResult = [...tmpResult.filter((v) => !affectedBuffs.map((v) => v.id).includes(v.id)), ...affectedBuffs]

      return {
        result: newResult,
        state: [...state, ...aState, ...spState, ...pState],
      }
    },
    { result: [] as Result, state: [] as State }
  )
}

function deriveBuffLanes(target: BuffTarget, selfLane: Lane, idol: ArrayN<IdolData | null, 5>): Lane[] {
  switch (target) {
    case 'all':
      return [0, 1, 2, 3, 4]
    case 'self':
      return [selfLane]
    case 'scorer-1': {
      const candidate = indexed(idol)
        .filter(([v]) => v?.role === 'scorer')
        .map(second)
        .sort(comparebyCenter)
      return [candidate[0]].filter(isNonNullable)
    }
    case 'scorer-2': {
      const candidate = indexed(idol)
        .filter(([v]) => v?.role === 'scorer')
        .map(second)
        .sort(comparebyCenter)
      return [candidate[0], candidate[1]].filter(isNonNullable)
    }
    default:
      return []
    // TODO
    // unreachable(target)
  }
}

export const isType =
  <Type extends string>(type: Type) =>
  <Value extends { type: string }>(value: Value): value is Extract<Value, { type: Type }> =>
    value.type === type

export const isDiv =
  <Div extends string>(div: Div) =>
  <Value extends { div: string }>(value: Value): value is Extract<Value, { div: Div }> =>
    value.div === div

const appendType =
  <S extends string>(type: S) =>
  <T>(v: T) => ({ ...v, type })

function second<T>([, value]: readonly [unknown, T]) {
  return value
}

function comparebyCenter(a: number, b: number) {
  return Math.abs(2.1 - a) - Math.abs(2.1 - b)
}
