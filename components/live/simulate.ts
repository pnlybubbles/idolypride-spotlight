import { BuffTarget, AbilityType, Lane, LiveData, SkillData, IdolData } from '~/utils/types'
import isNonNullable from 'is-non-nullable'
import { ArrayN, indexed, PartiallyNonNullable, uid, unreachable } from '~~/utils'

type Result = ({
  id: string
  // 表示開始位置
  beat: number
  // 色付けに使うバフID
  buff: AbilityType
  // 表示するレーン
  lane: Lane
} & (
  | {
      type: 'p'
    }
  | {
      type: 'sp' | 'a'
      // 失敗したか否か
      fail: boolean
      // 乗っているバフ
      // activated: { type: BuffAbilityType; amount: number }[]
    }
  | {
      type: 'buff'
      span: number
      // バフがスコア獲得スキルに当たったかどうか
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
      availableAbilities: { id: string; triggeredLane: Lane | null }[]
    }
))[]

type Idols = ArrayN<IdolData | null, 5>

export function simulate(live: LiveData, idols: Idols) {
  const BEATS = new Array(live.beat).fill(0).map((_, i) => i + 1)
  // 1ビートづつシミュレーションしていく
  return BEATS.reduce<{ result: Result; state: State }>(
    ({ result, state }, currentBeat) => {
      //
      // 1パス目
      // このビートで発動しているスキルを導出して状態(State)を更新する
      //

      const domain = { live, idols, state, currentBeat }

      // CT中のスキルを絞り込む
      const ctState = extractCtState(domain)

      // Aスキルの発動チェック
      const aState = deriveAState({ ...domain, ctState })

      const aResult = aState.map(({ lane, skill }) => ({
        type: 'a' as const,
        buff: skill?.ability.map((v) => (v.div === 'buff' ? v : null)).filter(isNonNullable)[0]?.type ?? 'unknown',
        lane,
        fail: skill === null,
      }))

      // Aスキルによるバフ
      const aBuffResult = deriveNaiveBuffResult(aState, domain)

      // SPスキルの発動チェック
      const spState = deriveSpState(domain)

      const spResult = spState.map(({ lane, skill }) => ({
        type: 'sp' as const,
        buff: skill?.ability.map((v) => (v.div === 'buff' ? v : null)).filter(isNonNullable)[0]?.type ?? 'unknown',
        lane,
        fail: skill === null,
      }))

      // SPスキルによるバフ
      const spBuffResult = deriveNaiveBuffResult(spState, domain)

      // Pスキルの発動チェック
      const pState = derivePState({ ...domain, ctState, aState, spState })

      const pResult = pState.map(({ lane, skill }) => ({
        type: 'p' as const,
        // とりあえず1個目の効果を優先
        buff: skill.ability.map((v) => (v.div === 'buff' ? v : null)).filter(isNonNullable)[0]?.type ?? 'unknown',
        lane,
      }))

      // Pスキルによるバフ
      const pBuffResult = pState.flatMap(({ lane, skill, availableAbilities }) => {
        return skill.ability
          .filter(isDiv('buff'))
          .map((ability) => {
            // スキルの効果の中で条件を満たしているもののみを抽出
            const available = availableAbilities.find((v) => v.id === ability.id)
            if (available === undefined) {
              return null
            }
            return [ability, available.triggeredLane] as const
          })
          .filter(isNonNullable)
          .flatMap(([ability, triggeredLane]) => {
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
              span: clampSpan(ability.span, live.beat, currentBeat),
            }))
          })
      })

      const buffResult = [...aBuffResult, ...spBuffResult, ...pBuffResult].map((v) => ({
        ...v,
        affected: false,
      }))
      const currentResult = [...aResult, ...spResult, ...pResult, ...buffResult].map((v) => ({
        ...v,
        beat: currentBeat,
        id: uid(),
      }))
      const tmpResult = [...result, ...currentResult]

      //
      // 2パス目
      // このビートで変化した状態を含めて、過去から現在までに発生したバフの影響を導出する
      //

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
    { result: [], state: [] }
  )
}

type DomainState = {
  live: LiveData
  idols: Idols
  state: State
  ctState: CtState
  aState: AState
  spState: SpState
  currentBeat: number
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

const deriveNaiveBuffResult = (
  state: { lane: Lane; skill: Extract<SkillData, { type: 'sp' | 'a' }> | null }[],
  { idols, live, currentBeat }: Pick<DomainState, 'idols' | 'live' | 'currentBeat'>
) => {
  return state.flatMap(({ lane, skill }) => {
    // nullのときはスキル失敗なので、バフの計算はしない
    if (skill === null) {
      return []
    }
    return skill.ability.filter(isDiv('buff')).flatMap((ability) => {
      const lanes = deriveBuffLanes(ability.target, lane, idols)
      return lanes.map((lane) => ({
        type: 'buff' as const,
        buff: ability.type,
        lane,
        span: clampSpan(ability.span, live.beat, currentBeat),
      }))
    })
  })
}

type APStateItem = Extract<State[number], { type: 'a' | 'p' }>
type CtState = (
  | PartiallyNonNullable<Extract<APStateItem, { type: 'a' }>, 'skill'>
  | Extract<APStateItem, { type: 'p' }>
)[]

const extractCtState = ({ state, currentBeat }: Pick<DomainState, 'state' | 'currentBeat'>): CtState => {
  const inCT = (beat: number, ct: number) => beat + ct >= currentBeat

  return (
    state
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
          // ライブ中1回のチェック
          if (v.skill.ct === 0) {
            return v
          }
          // CTチェック
          if (!inCT(v.beat, v.skill.ct)) {
            return null
          }
          return v
        }
        return unreachable(v)
      })
      .filter(isNonNullable)
  )
}

type AState = Extract<State[number], { type: 'a' }>[]

const deriveAState = (domain: Pick<DomainState, 'live' | 'idols' | 'currentBeat' | 'state' | 'ctState'>): AState => {
  const { live, idols, currentBeat, ctState } = domain

  return indexed(live.a)
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
        .sort((a, b) => a.index - b.index)
      return { lane, skill: canTriggerSkills?.[0] ?? null }
    })
    .filter(isNonNullable)
    .map(appendBeat(currentBeat))
    .map(appendType('a'))
}

type SpState = Extract<State[number], { type: 'sp' }>[]

const deriveSpState = (domain: Pick<DomainState, 'live' | 'idols' | 'currentBeat'>): SpState => {
  const { live, idols, currentBeat } = domain
  return indexed(live.sp)
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
    .map(appendBeat(currentBeat))
    .map(appendType('sp'))
}

type PState = Extract<State[number], { type: 'p' }>[]

const derivePState = (
  domain: Pick<DomainState, 'idols' | 'currentBeat' | 'ctState' | 'aState' | 'spState'>
): PState => {
  const { idols, currentBeat, ctState, aState, spState } = domain
  return indexed(idols)
    .flatMap(([idol, lane]) => {
      // CT中ではない発動可能なPスキルがあるかチェック
      const ctSkills = ctState
        .filter((v) => v.lane === lane)
        .map((v) => v.skill)
        .filter(isType('p'))
      const canTriggerSkills =
        idol?.skills.filter(isType('p')).filter((skill) => !ctSkills.map((v) => v.index).includes(skill.index)) ?? []
      return canTriggerSkills
        .map((skill) => {
          const triggeredAbility = skill.ability
            .map((ability) => {
              switch (ability.condition.type) {
                case 'none': {
                  // 無条件
                  return { triggeredLane: null, ability }
                }
                case 'sp': {
                  // 誰かがSPスキルは発動時
                  const spLane = spState.find((v) => v.skill != null)?.lane
                  return spLane === undefined ? null : { triggeredLane: spLane, ability }
                }
                case 'a': {
                  // 誰かがAスキル発動時
                  const aLane = aState.find((v) => v.skill != null)?.lane
                  return aLane === undefined ? null : { triggeredLane: aLane, ability }
                }
                default:
                  return null
              }
            })
            .filter(isNonNullable)
          if (triggeredAbility.length === 0) {
            return null
          }
          return {
            skill,
            availableAbilities: triggeredAbility.map(({ ability, triggeredLane }) => ({
              id: ability.id,
              triggeredLane,
            })),
          }
        })
        .filter(isNonNullable)
        .map((v) => ({ ...v, lane }))
    })
    .map(appendBeat(currentBeat))
    .map(appendType('p'))
}

const appendBeat =
  (currentBeat: number) =>
  <T>(v: T) => ({ ...v, beat: currentBeat })

const clampSpan = (span: number, liveBeat: number, currentBeat: number) => Math.min(span, liveBeat - currentBeat + 1)

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
