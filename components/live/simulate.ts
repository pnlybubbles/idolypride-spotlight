import {
  ActiveBuffTarget,
  AbilityType,
  Lane,
  LiveData,
  SkillData,
  IdolData,
  BuffAbilityType,
  SkillIndex,
  PassiveAbilityData,
} from '~/utils/types'
import isNonNullable from 'is-non-nullable'
import { ArrayN, indexed, PartiallyNonNullable, uid, unreachable } from '~~/utils'
import { isBuffAbilityType } from '~~/utils/formatter'
import { produce } from 'immer'

export type Result = ({
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
      index: SkillIndex
    }
  | {
      type: 'sp' | 'a'
      index: SkillIndex | undefined
      // 失敗したか否か
      fail: boolean
      // 乗っているバフ
      activated: { type: BuffAbilityType; amount: number }[]
    }
  | {
      type: 'buff'
      amount: number
      span: number
      // バフがスコア獲得スキルに当たったかどうか
      affected: boolean
    }
))[]

type BuffResult = Extract<Result[number], { type: 'buff' }>[]

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
  // 無条件のPスキルは0ビート目で発動扱いになるので、実質的に0ビート目を追加で処理する
  // 無条件PスキルCT50,持続20ビートの場合:
  // - 1ビート目通過後に残りCT49表示
  // - 50ビート目に2回目が発動
  // - 0ビート目発動扱いで19ビート目までバフ持続
  const BEATS = new Array(live.beat + 1).fill(0).map((_, i) => i)
  // 1ビートづつシミュレーションしていく
  return BEATS.reduce<{ result: Result; state: State }>(
    produce((draft, currentBeat) => {
      //
      // 1パス目
      // このビートで発動しているPスキルの判定
      //

      // eslint-disable-next-line no-constant-condition
      while (true) {
        const domain = { live, idols, state: draft.state, currentBeat }

        // CT中のスキルを絞り込む
        const ctState = extractCtState(domain)

        // 現在のビートに効いている過去も含めたすべてのバフを取得
        const availableBuff = extractAvailableBuffResult(draft.result, domain)

        // Pスキルの発動チェック
        const pState = derivePState({ ...domain, ctState, aState: [], spState: [], availableBuff })

        const pResult = pState.map(({ lane, skill }) => ({
          type: 'p' as const,
          // とりあえず1個目の効果を優先
          buff: skill.ability.map((v) => (v.div === 'buff' ? v : null)).filter(isNonNullable)[0]?.type ?? 'unknown',
          lane,
          index: skill.index,
          beat: currentBeat,
          id: uid(),
        }))

        // Pスキルによるバフ
        const pBuffResult = derivePBuffResult({ pState, ...domain })

        // 更新処理
        const currentResult = [...pResult, ...pBuffResult.map((v) => ({ ...v, affected: false }))]

        draft.result.push(...currentResult)
        draft.state.push(...pState)

        // すべてのトリガが発動しきったら1パス目終了
        if (pState.length === 0) {
          break
        }
      }

      //
      // 2パス目
      // A,SPスキルの発動チェック
      //
      let aState: AState
      let spState: SpState
      {
        const domain = { live, idols, state: draft.state, currentBeat }

        // CT中のスキルを絞り込む
        const ctState = extractCtState(domain)

        // Aスキルの発動チェック
        aState = deriveAState({ ...domain, ctState })

        const aResult = aState.map(({ lane, skill }) => ({
          type: 'a' as const,
          buff: skill?.ability.map((v) => (v.div === 'buff' ? v : null)).filter(isNonNullable)[0]?.type ?? 'unknown',
          lane,
          fail: skill === null,
          index: skill?.index,
          beat: currentBeat,
          id: uid(),
        }))

        // Aスキルによるバフ
        const aBuffResult = deriveNaiveBuffResult(aState, domain)

        // SPスキルの発動チェック
        spState = deriveSpState(domain)

        const spResult = spState.map(({ lane, skill }) => ({
          type: 'sp' as const,
          buff: skill?.ability.map((v) => (v.div === 'buff' ? v : null)).filter(isNonNullable)[0]?.type ?? 'unknown',
          lane,
          fail: skill === null,
          index: skill?.index,
          beat: currentBeat,
          id: uid(),
        }))

        // SPスキルによるバフ
        const spBuffResult = deriveNaiveBuffResult(spState, domain)

        // 更新処理
        const currentResult = [
          ...[...aResult, ...spResult].map((v) => ({ ...v, activated: [] })),
          ...[...aBuffResult, ...spBuffResult].map((v) => ({ ...v, affected: false })),
        ]

        draft.result.push(...currentResult)
        draft.state.push(...aState, ...spState)
      }

      //
      // 3パス目
      // A,SPのバフをトリガとしたPスキルの発動チェック
      //

      // eslint-disable-next-line no-constant-condition
      while (true) {
        const domain = { live, idols, state: draft.state, currentBeat }

        // CT中のスキルを絞り込む
        const ctState = extractCtState(domain)

        // 現在のビートに効いている過去も含めたすべてのバフを取得
        const availableBuff = extractAvailableBuffResult(draft.result, domain)

        // Pスキルの発動チェック
        const pState = derivePState({ ...domain, ctState, aState, spState, availableBuff })

        const pResult = pState.map(({ lane, skill }) => ({
          type: 'p' as const,
          // とりあえず1個目の効果を優先
          buff: skill.ability.map((v) => (v.div === 'buff' ? v : null)).filter(isNonNullable)[0]?.type ?? 'unknown',
          lane,
          index: skill.index,
          beat: currentBeat,
          id: uid(),
        }))

        // Pスキルによるバフ
        const pBuffResult = derivePBuffResult({ pState, ...domain })

        // 更新処理
        const currentResult = [...pResult, ...pBuffResult.map((v) => ({ ...v, affected: false }))]

        draft.result.push(...currentResult)
        draft.state.push(...pState)

        // すべてのトリガが発動しきったら1パス目終了
        if (pState.length === 0) {
          break
        }
      }

      //
      // 4パス目
      // このビートで変化した状態を含めて、過去から現在までに発生したバフの影響を導出する
      //

      // スコア獲得スキルにバフが効いているかをチェック
      // 注意:
      // - このビートで発動したSP,A,Pスキルでのバフはそのスキル自身のスコア獲得に影響を与える (Pは未検証)
      // - スコア獲得スキルを持たないSP,Aスキルは存在しない前提

      // 現在のビートに効いている過去も含めたすべてのバフを取得
      const availableBuff = extractAvailableBuffResult(draft.result, { currentBeat })
      // TODO: Pのスコア獲得スキル対応
      // スコア獲得スキルが発動したレーン
      const scoredLanes = draft.state
        .filter((v) => v.beat === currentBeat && (v.type === 'sp' || v.type === 'a'))
        .map((v) => v.lane)
      // affectedを適用する
      for (const v of availableBuff) {
        if (!scoredLanes.includes(v.lane)) {
          continue
        }
        v.affected = true
      }

      // TODO: Pのスコア獲得スキル対応
      // このビートで発動したスコア獲得スキルに効いているバフを反映する
      const resultInCurrrentBeat = draft.result.filter((v) => v.beat === currentBeat)
      for (const v of resultInCurrrentBeat) {
        if (v.type !== 'a' && v.type !== 'sp') {
          continue
        }
        v.activated = availableBuff
          .filter((w) => w.lane === v.lane)
          // スコアスキルに影響するのは持続効果のみなのでBuffAbilityに絞る
          .map((w) => (isBuffAbilityType(w.buff) ? { type: w.buff, amount: w.amount } : null))
          .filter(isNonNullable)
      }
    }),
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
  pState: PState
  currentBeat: number
  availableBuff: BuffResult
}

function deriveBuffLanes(target: ActiveBuffTarget, selfLane: Lane, idol: ArrayN<IdolData | null, 5>): Lane[] {
  switch (target) {
    case 'all':
      return [0, 1, 2, 3, 4]
    case 'self':
      return [selfLane]
    case 'center':
      return [2]
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
        amount: ability.amount,
        beat: currentBeat,
        id: uid(),
      }))
    })
  })
}

const derivePBuffResult = ({
  pState,
  live,
  idols,
  currentBeat,
}: Pick<DomainState, 'pState' | 'idols' | 'live' | 'currentBeat'>) => {
  return pState.flatMap(({ lane, skill, availableAbilities }) => {
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
          amount: ability.amount,
          beat: currentBeat,
          id: uid(),
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
  // 発動ビートから1ビート経つと1CTを消化したことになる
  // アイプラ上の表示では発動ビート直後でCT29と出る (CT30の場合)
  // これは切り捨て表示であり、29CTまるまる残っている & 消化中の1未満のCTがある状態
  // つまりスキル間がちょうど30ビート(86,116など)であれば、CT30をちょうど消化しきることができる
  const inCT = (beat: number, ct: number) => beat + ct - 1 >= currentBeat

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

const deriveAState = (domain: Pick<DomainState, 'live' | 'idols' | 'currentBeat' | 'ctState'>): AState => {
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
  domain: Pick<DomainState, 'idols' | 'currentBeat' | 'ctState' | 'aState' | 'spState' | 'availableBuff'>
): PState => {
  const { idols, currentBeat, ctState } = domain
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
            .map((ability) => deriveTriggeredAbilityWithCondition(ability, lane, domain))
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

const deriveTriggeredAbilityWithCondition = (
  ability: PassiveAbilityData,
  lane: Lane,
  {
    spState,
    aState,
    availableBuff,
    currentBeat,
  }: Pick<DomainState, 'aState' | 'spState' | 'currentBeat' | 'availableBuff'>
): { triggeredLane: Lane | null; ability: PassiveAbilityData } | null => {
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
    case 'combo': {
      // Xコンボ以上時
      if (currentBeat >= ability.condition.amount) {
        return { triggeredLane: null, ability }
      }
      return null
    }
    case 'score-up': {
      // 自身がスコアアップ状態の時
      return isBuffedFor(availableBuff, 'score', lane) ? { triggeredLane: null, ability } : null
    }
    case 'anyone-tension-up': {
      // 誰かがテンションアップ状態の時
      const hit = isBuffedFor(availableBuff, 'tension')
      return hit ? { triggeredLane: hit.lane, ability } : null
    }
    default:
      return null
  }
}

const isBuffedFor = (availableBuff: BuffResult, buff: AbilityType, lane?: Lane) =>
  availableBuff.find((v) => (lane === undefined || v.lane === lane) && v.buff === buff)

const extractAvailableBuffResult = (result: Result, { currentBeat }: Pick<DomainState, 'currentBeat'>) =>
  result.filter(isType('buff')).filter(
    (v) =>
      // スキルが発動したビートからバフがかかる
      // バフがかかる最後のビートは、発動ビート + 持続ビート数 - 1
      currentBeat >= v.beat && currentBeat <= v.beat + v.span - 1
  )

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
