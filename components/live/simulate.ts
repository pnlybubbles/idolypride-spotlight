import {
  ActiveBuffTarget,
  AbilityType,
  Lane,
  LiveData,
  SkillData,
  IdolData,
  BuffAbilityType,
  SkillIndex,
  LaneConfig,
  AbilityCondition,
} from '~/utils/types'
import isNonNullable from 'is-non-nullable'
import { ArrayN, indexed, isUnique, mapArrayN, PartiallyNonNullable, safeParseInt, uid, unreachable } from '~~/utils'
import { isBuffAbilityType, pickSkillsByLevel } from '~~/utils/formatter'
import { produce } from 'immer'
import { extractBuffTarget } from '../idol-form/helper'
import { isLane, LANES } from '~~/utils/common'

export type Result = ({
  // 注意: a,sp,pはStateと共通
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
      // 発動したバフ
      activated: { abilityId: string; type: BuffAbilityType; amount: number; target: Lane[] }[]
    }
  | {
      type: 'sp' | 'a'
      index: SkillIndex | undefined
      // 失敗したか否か
      fail: boolean
      // 載っているバフ(Result['id'])
      affected: { id: string; type: BuffAbilityType; amount: number }[]
      // 発動したバフ
      activated: { abilityId: string; type: BuffAbilityType; amount: number; target: Lane[] }[]
    }
  | {
      type: 'buff'
      amount: number
      span: number
      // バフがスコア獲得スキルに当たったかどうか
      affecting: boolean
      // どのスキル(Result['id'])から発動したか
      activatedBy: string
      abilityId: string
    }
))[]

type BuffResult = Extract<Result[number], { type: 'buff' }>[]

// 発生したスキルを記録する
type State = ({
  id: string
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
      triggeredLane: Lane | null
    }
))[]

// 未処理のシフト効果を保持する
type ShiftState = {
  type: 'a' | 'sp'
  buff: BuffResult[number]
  activated: boolean
}[]

type Idols = ArrayN<IdolData | null, 5>

export function simulate(live: LiveData, rawIdols: Idols, laneConfig: LaneConfig) {
  const idols = mapArrayN(rawIdols, (idol) =>
    idol ? { ...idol, skills: pickSkillsByLevel(idol.skills, idol.owned?.skillLevels ?? undefined) } : null
  )
  // 無条件のPスキルは0ビート目で発動扱いになるので、実質的に0ビート目を追加で処理する
  // 無条件PスキルCT50,持続20ビートの場合:
  // - 1ビート目通過後に残りCT49表示
  // - 50ビート目に2回目が発動
  // - 0ビート目発動扱いで19ビート目までバフ持続
  const BEATS = new Array(live.beat + 1).fill(0).map((_, i) => i)
  // 1ビートづつシミュレーションしていく
  return BEATS.reduce<{ result: Result; state: State; shift: ShiftState }>(
    produce((draft, currentBeat) => {
      //
      // 1パス目
      // A,SPスキルの発動チェック
      //
      let aState: AState
      let spState: SpState
      {
        const domain = { live, idols, state: draft.state, currentBeat, laneConfig }

        // CT中のスキルを絞り込む
        const ctState = extractCtState(domain)

        // Aスキルの発動チェック
        aState = deriveAState({ ...domain, ctState })

        // Aスキルによるバフ
        const aBuffResult = deriveNaiveBuffResult(aState, domain)

        const aResult = aState.map(({ id, lane, skill }) => ({
          type: 'a' as const,
          // とりあえず色付けだけにつかってるので、スコア獲得はunknownとして扱ってしまう
          buff: skill?.ability.map((v) => (v.div !== 'score' ? v : null)).filter(isNonNullable)[0]?.type ?? 'unknown',
          lane,
          fail: skill === null,
          index: skill?.index,
          beat: currentBeat,
          activated: deriveActivated(aBuffResult, id),
          id,
        }))

        // SPスキルの発動チェック
        spState = deriveSpState(domain)

        // SPスキルによるバフ
        const spBuffResult = deriveNaiveBuffResult(spState, domain)

        const spResult = spState.map(({ id, lane, skill }) => ({
          type: 'sp' as const,
          buff: skill?.ability.map((v) => (v.div !== 'score' ? v : null)).filter(isNonNullable)[0]?.type ?? 'unknown',
          lane,
          fail: skill === null,
          index: skill?.index,
          beat: currentBeat,
          activated: deriveActivated(spBuffResult, id),
          id,
        }))

        // 更新処理
        const currentResult = [
          ...[...aResult, ...spResult].map((v) => ({ ...v, affected: [] })),
          ...[...aBuffResult, ...spBuffResult].map((v) => ({ ...v, affecting: false })),
        ]

        draft.result.push(...currentResult)
        draft.state.push(...aState, ...spState)

        //
        // CT中ステートのミューテーション処理
        //

        for (const state of ctState) {
          for (const effectAbility of deriveAffectedState([...aState, ...spState], state.lane, domain)) {
            if (effectAbility.div === 'action-buff') {
              // CT減少
              // CT=0 はライブ中1回の特殊ケース
              if (effectAbility.type === 'ct-reduction' && state.skill.ct !== 0) {
                state.skill.ct = Math.max(state.skill.ct - effectAbility.amount, 1)
              }
            }
          }
        }

        //
        // バフ表示のミューテーション処理
        //

        // 現在のビートに効いている過去も含めたすべてのバフを取得
        const availableBuff = extractAvailableBuffResult(draft.result, { currentBeat })

        for (const { ability, beat, lane, targetLanes } of activatedAbilities([...aState, ...spState], domain)) {
          // 強化効果譲渡
          // TODO: 譲渡効果が発動したそのスキル自身のスコアにはバフが影響しない？(不明なのでいったん影響なしにした)
          if (ability.div === 'action-buff' && ability.type === 'delegate-buff') {
            // NOTE: 譲渡先が複数あるケースはおそらく無いので、対象が複数ある場合は1つ目のみを参照する
            const delegatedToLane = targetLanes.sort(comparebyCenter)[0]
            if (delegatedToLane === undefined) {
              continue
            }

            for (const buffResult of availableBuff) {
              if (buffResult.lane === lane) {
                // スキルが発動した自身のレーンの効果を対象のレーンに移動する
                draft.result.push({
                  ...buffResult,
                  id: uid(),
                  lane: delegatedToLane,
                  beat,
                  span: buffResult.span - (beat - buffResult.beat),
                })
                buffResult.span = beat - buffResult.beat
              }
            }
          }
        }
      }

      //
      // 2パス目
      // A,SPのバフをトリガとしたPスキルの発動チェック
      //
      let pState: PState
      {
        const domain = { live, idols, state: draft.state, currentBeat, laneConfig }

        // CT中のスキルを絞り込む
        const ctState = extractCtState(domain)

        // 現在のビートに効いている過去も含めたすべてのバフを取得
        const availableBuffBeforeP = extractAvailableBuffResult(draft.result, domain)

        // Pスキルの発動チェック
        pState = derivePState({ ...domain, ctState, aState, spState, availableBuff: availableBuffBeforeP })

        // Pスキルによるバフ
        const pBuffResult = derivePBuffResult({ pState, ...domain })

        const pResult = pState.map(({ id, lane, skill }) => ({
          type: 'p' as const,
          // とりあえず1個目の効果を優先
          buff: skill.ability.map((v) => (v.div !== 'score' ? v : null)).filter(isNonNullable)[0]?.type ?? 'unknown',
          lane,
          index: skill.index,
          beat: currentBeat,
          activated: deriveActivated(pBuffResult, id),
          id,
        }))

        // 更新処理
        const currentResult = [...pResult, ...pBuffResult.map((v) => ({ ...v, affecting: false }))]

        draft.result.push(...currentResult)
        draft.state.push(...pState)

        //
        // CT中ステートのミューテーション処理
        // TODO: DRY
        //

        for (const state of ctState) {
          for (const effectAbility of deriveAffectedState(pState, state.lane, domain)) {
            if (effectAbility.div === 'action-buff') {
              // CT減少
              // CT=0 はライブ中1回の特殊ケース
              if (effectAbility.type === 'ct-reduction' && state.skill.ct !== 0) {
                state.skill.ct = Math.max(state.skill.ct - effectAbility.amount, 1)
              }
            }
          }
        }

        //
        // バフ表示のミューテーション処理
        // TODO: DRY
        //

        // 現在のビートに効いている過去も含めたすべてのバフを取得
        const availableBuff = extractAvailableBuffResult(draft.result, { currentBeat })

        for (const { ability, beat, lane, targetLanes } of activatedAbilities(pState, domain)) {
          // 強化効果譲渡
          // TODO: 譲渡効果が発動したそのスキル自身のスコアにはバフが影響しない？(不明なのでいったん影響なしにした)
          if (ability.div === 'action-buff' && ability.type === 'delegate-buff') {
            // NOTE: 譲渡先が複数あるケースはおそらく無いので、対象が複数ある場合は1つ目のみを参照する
            const delegatedToLane = targetLanes.sort(comparebyCenter)[0]
            if (delegatedToLane === undefined) {
              continue
            }

            for (const buffResult of availableBuff) {
              if (buffResult.lane === lane) {
                // スキルが発動した自身のレーンの効果を対象のレーンに移動する
                draft.result.push({
                  ...buffResult,
                  id: uid(),
                  lane: delegatedToLane,
                  beat,
                  span: buffResult.span - (beat - buffResult.beat),
                })
                buffResult.span = beat - buffResult.beat
              }
            }
          }
        }
      }

      //
      // 3パス目
      // SPシフトの発動処理 (TODO: Aシフト)
      //
      {
        const domain = { live, idols, state: draft.state, currentBeat, laneConfig }

        // 現在のビートに効いている過去も含めたすべてのバフを取得
        const availableBuff = extractAvailableBuffResult(draft.result, { currentBeat })

        // ミューテーション処理
        // SPシフトの効果が発動可能な場合は、効いているバフを取り除いて保持する
        for (const buffResult of availableBuff) {
          for (const effectAbility of deriveAffectedState(
            [...aState, ...spState, ...pState],
            buffResult.lane,
            domain
          )) {
            if (effectAbility.div === 'action-buff' && effectAbility.type === 'shift-before-sp') {
              // SPシフト
              const currentSpan = currentBeat - buffResult.beat
              // シフト処理待ちとして保持する
              draft.shift.push({
                type: 'sp',
                buff: { ...buffResult, span: buffResult.span - currentSpan },
                activated: false,
              })
              // 現在効いているバフの効果を消す
              buffResult.span = currentSpan
            }
          }
        }

        // このビートでSPスキルが発動している場合に、保持されているシフト待ちのバフを展開する
        for (const state of spState) {
          for (const shiftState of draft.shift) {
            if (!shiftState.activated && state.lane === shiftState.buff.lane) {
              // シフトしたバフを記録
              draft.result.push({
                ...shiftState.buff,
                id: uid(),
                beat: currentBeat,
                span: deriveRealSpan(shiftState.buff.span, live.beat, currentBeat),
              })
              shiftState.activated = true
            }
          }
        }
      }

      //
      // 4パス目
      // 強化延長の発動処理
      //
      {
        const domain = { live, idols, state: draft.state, currentBeat, laneConfig }

        // 現在のビートに効いている過去も含めたすべてのバフを取得
        const availableBuff = extractAvailableBuffResult(draft.result, { currentBeat })

        for (const buffResult of availableBuff) {
          for (const effectAbility of deriveAffectedState(
            [...aState, ...spState, ...pState],
            buffResult.lane,
            domain
          )) {
            if (effectAbility.div === 'action-buff' && effectAbility.type === 'buff-span') {
              // 効果を延長する
              buffResult.span = deriveRealSpan(buffResult.span + effectAbility.amount, live.beat, buffResult.beat)
            }
          }
        }
      }

      //
      // 5パス目
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
        v.affecting = true
      }

      // TODO: Pのスコア獲得スキル対応
      // このビートで発動したスコア獲得スキルに効いているバフを反映する
      const resultInCurrrentBeat = draft.result.filter((v) => v.beat === currentBeat)
      for (const v of resultInCurrrentBeat) {
        if (v.type !== 'a' && v.type !== 'sp') {
          continue
        }
        v.affected = availableBuff
          .filter((w) => w.lane === v.lane)
          // スコアスキルに影響するのは持続効果のみなのでBuffAbilityに絞る
          .map((w) => (isBuffAbilityType(w.buff) ? { id: w.id, type: w.buff, amount: w.amount } : null))
          .filter(isNonNullable)
      }
    }),
    { result: [], state: [], shift: [] }
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
  laneConfig: LaneConfig
}

/**
 * `suffixedTarget`をパースして対象となるレーンを返す
 */
function deriveBuffLanes(
  suffixedTarget: ActiveBuffTarget,
  selfLane: Lane,
  idol: ArrayN<IdolData | null, 5>,
  laneConfig: LaneConfig
): Lane[] {
  const { target, targetSuffix } = extractBuffTarget(suffixedTarget)
  const suffix = safeParseInt(targetSuffix) ?? 0
  switch (target) {
    case 'all':
      return [0, 1, 2, 3, 4]
    case 'self':
      return [selfLane]
    case 'center':
      return [2]
    case 'neighbor':
      return [selfLane - 1, selfLane + 1].filter(isLane)
    case 'scorer': {
      const candidate = indexed(idol)
        .filter(([v]) => v?.role === 'scorer')
        .map(second)
        .sort(comparebyCenter)
      return candidate.slice(0, suffix)
    }
    case 'vocal':
    case 'visual':
    case 'dance':
    case 'high-vocal':
    case 'high-visual':
    case 'high-dance': {
      // ボーカルが高い2人などの実際のステータスは出せないので、ボーカル2人と同じように中央からソートした順にする
      // TODO: 注意書き
      const transformedTarget =
        target === 'high-vocal'
          ? 'vocal'
          : target === 'high-visual'
          ? 'visual'
          : target === 'high-dance'
          ? 'dance'
          : target
      const candidate = indexed(idol)
        .filter(([v]) => v?.type === transformedTarget)
        .map(second)
        .sort(comparebyCenter)
      // ~~が高いX人の場合は属性が一致していなくても中心から優先的にX人選ばれるようにする
      // TODO: 特定のタイプが高いアイドルを選択できるようにする
      const naiveCandidate =
        target === 'high-vocal' || target === 'high-visual' || target === 'high-dance'
          ? [...LANES].sort(comparebyCenter)
          : []
      return [...candidate, ...naiveCandidate].filter(isUnique).slice(0, suffix)
    }
    case 'vocal-lane':
    case 'visual-lane':
    case 'dance-lane': {
      const transformedTarget =
        target === 'vocal-lane'
          ? 'vocal'
          : target === 'visual-lane'
          ? 'visual'
          : target === 'dance-lane'
          ? 'dance'
          : unreachable(target)
      const candidate = indexed(laneConfig)
        .filter(([v]) => v.type === transformedTarget)
        .map(second)
        .sort(comparebyCenter)
      return candidate.slice(0, suffix)
    }
    default:
      return []
    // TODO
    // unreachable(target)
  }
}

/**
 * `state`の中から`currentLane`が対象になっているスキルの効果のみを抽出する
 */
const deriveAffectedState = (state: State, currentLane: Lane, domain: Pick<DomainState, 'idols' | 'laneConfig'>) => {
  const { idols, laneConfig } = domain
  return state
    .flatMap((v) =>
      v.skill === null
        ? []
        : v.type === 'p'
        ? v.skill.ability
            .filter((w) => filterCondition(w.condition, v.lane, v.beat, domain))
            .map((w) =>
              w.div === 'score'
                ? null
                : w.target === 'triggered'
                ? v.triggeredLane === currentLane
                  ? w
                  : null
                : deriveBuffLanes(w.target, v.lane, idols, laneConfig).includes(currentLane)
                ? w
                : null
            )
        : v.skill.ability.map((w) =>
            w.div !== 'score' && deriveBuffLanes(w.target, v.lane, idols, laneConfig).includes(currentLane) ? w : null
          )
    )
    .filter(isNonNullable)
}

/**
 * 発動済みスキルの状態から、有効な効果のみを抽出する
 */
const activatedAbilities = (state: State, { idols, laneConfig }: Pick<DomainState, 'idols' | 'laneConfig'>) =>
  state.flatMap((v) =>
    (v.type === 'p'
      ? v.skill.ability.map((ability) => ({
          ability,
          targetLanes:
            ability.div === 'score'
              ? []
              : ability.target === 'triggered'
              ? v.triggeredLane !== null
                ? [v.triggeredLane]
                : []
              : deriveBuffLanes(ability.target, v.lane, idols, laneConfig),
        }))
      : (v.skill?.ability ?? []).map((ability) => ({
          ability,
          targetLanes: ability.div === 'score' ? [] : deriveBuffLanes(ability.target, v.lane, idols, laneConfig),
        }))
    )
      .filter(({ ability }) => filterCondition(ability.condition, v.lane, v.beat, { idols, laneConfig }))
      .map((w) => ({ ...w, beat: v.beat, lane: v.lane }))
  )

const deriveNaiveBuffResult = (
  state: { id: string; lane: Lane; beat: number; skill: Extract<SkillData, { type: 'sp' | 'a' }> | null }[],
  domain: Pick<DomainState, 'idols' | 'live' | 'currentBeat' | 'laneConfig'>
) => {
  const { idols, live, currentBeat, laneConfig } = domain
  return state.flatMap(({ id, lane, beat, skill }) => {
    // nullのときはスキル失敗なので、バフの計算はしない
    if (skill === null) {
      return []
    }
    return skill.ability
      .filter(isDiv('buff'))
      .filter((ability) => filterCondition(ability.condition, lane, beat, domain))
      .flatMap((ability) => {
        const lanes = deriveBuffLanes(ability.target, lane, idols, laneConfig)
        return lanes.map((lane) => ({
          type: 'buff' as const,
          buff: ability.type,
          lane,
          span: deriveRealSpan(ability.span, live.beat, currentBeat),
          amount: ability.amount,
          beat: currentBeat,
          activatedBy: id,
          abilityId: ability.id,
          id: uid(),
        }))
      })
  })
}

const derivePBuffResult = (domain: Pick<DomainState, 'pState' | 'idols' | 'live' | 'currentBeat' | 'laneConfig'>) => {
  const { pState, idols, live, currentBeat, laneConfig } = domain
  return pState.flatMap(({ id, lane, beat, skill, triggeredLane }) => {
    return skill.ability
      .filter(isDiv('buff'))
      .filter((ability) => filterCondition(ability.condition, lane, beat, domain))
      .flatMap((ability) => {
        const lanes =
          ability.target === 'triggered'
            ? triggeredLane !== null
              ? [triggeredLane]
              : []
            : deriveBuffLanes(ability.target, lane, idols, laneConfig)
        return lanes.map((lane) => ({
          type: 'buff' as const,
          buff: ability.type,
          lane,
          span: deriveRealSpan(ability.span, live.beat, currentBeat),
          amount: ability.amount,
          beat: currentBeat,
          activatedBy: id,
          abilityId: ability.id,
          id: uid(),
        }))
      })
  })
}

const deriveActivated = (
  buffResult: {
    abilityId: string
    buff: BuffAbilityType
    amount: number
    lane: Lane
    activatedBy: string
  }[],
  activatedBy: string
) =>
  buffResult
    .filter((v) => v.activatedBy === activatedBy)
    .reduce<{ abilityId: string; type: BuffAbilityType; amount: number; target: Lane[] }[]>(
      (acc, { abilityId, buff, amount, lane }) =>
        produce(acc, (draft) => {
          const index = acc.findIndex((v) => v.abilityId === abilityId)
          if (index !== -1) {
            draft[index]?.target.push(lane)
          } else {
            draft.push({
              abilityId,
              type: buff,
              amount,
              target: [lane],
            })
          }
        }),
      []
    )

const filterCondition = (
  condition: AbilityCondition,
  lane: Lane,
  beatOnAbility: number,
  { laneConfig }: Pick<DomainState, 'idols' | 'laneConfig'>
) => {
  switch (condition.type) {
    case 'in-vocal-lane':
    case 'in-visual-lane':
    case 'in-dance-lane': {
      // Xレーンの時
      const type =
        condition.type === 'in-vocal-lane'
          ? 'vocal'
          : condition.type === 'in-visual-lane'
          ? 'visual'
          : condition.type === 'in-dance-lane'
          ? 'dance'
          : unreachable(condition.type)
      return laneConfig[lane].type === type
    }
    case 'in-center':
      // 自身がセンター時
      return lane === 2
    case 'combo':
      // Xコンボ以上時
      return beatOnAbility >= condition.amount
    case 'combo-less-than':
      // Xコンボ以下時
      return beatOnAbility <= condition.amount
    default:
      // TODO: とりあえずケースが多すぎるので理想状態を目指すと仮定して素通りさせる
      return true
  }
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
    .map(([laneConfig, lane]) => {
      // いまのビートがAのタイミングかどうかをチェック
      const skillTiming = laneConfig.find((beat) => beat === currentBeat)
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
    .map(appendId)
}

type SpState = Extract<State[number], { type: 'sp' }>[]

const deriveSpState = (domain: Pick<DomainState, 'live' | 'idols' | 'currentBeat'>): SpState => {
  const { live, idols, currentBeat } = domain
  return indexed(live.sp)
    .map(([laneConfig, lane]) => {
      // いまのビートがSPのタイミングかどうかをチェック
      const skillTiming = laneConfig.find((beat) => beat === currentBeat)
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
    .map(appendId)
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
      const canTriggerSkills = idol?.skills
        .filter(isType('p'))
        .filter((skill) => !ctSkills.map((v) => v.index).includes(skill.index))
      return (canTriggerSkills ?? [])
        .map((skill) => {
          const triggered = checkSkillTriggered(skill, lane, domain)
          if (triggered === null) {
            return null
          }
          return {
            skill,
            triggeredLane: triggered.triggeredLane,
          }
        })
        .filter(isNonNullable)
        .map((v) => ({ ...v, lane }))
        .sort((a, b) => {
          // pスキルは基本的に2番目が優先。ただし発動条件がついている場合はその他の無条件よりも優先度は下がる
          // 例:
          // - "私に、決めたよ" 佐伯遙子 は2番目のスキルに"自身がボーカルレーンの時"の条件がついているので3番目が優先
          // - "a piece of cake" kana は2番目のスキルに"自身がダンスレーンの時"の条件がついているので3番目が優先
          // - "メイクアップタ〜イム" 早坂芽衣 は2番目のスキルに"スタミナが80%以上の時"の条件がついているので3番目が優先
          const hasConditionOrdering =
            (a.skill.trigger.type === 'none' && a.skill.ability.every((v) => v.condition.type === 'none') ? 0 : 1) -
            (b.skill.trigger.type === 'none' && b.skill.ability.every((v) => v.condition.type === 'none') ? 0 : 1)
          if (hasConditionOrdering !== 0) {
            return hasConditionOrdering
          }
          return a.skill.index - b.skill.index
        })
        .filter((_, i) => i === 0)
    })
    .map(appendBeat(currentBeat))
    .map(appendType('p'))
    .map(appendId)
}

const checkSkillTriggered = (
  skill: Extract<SkillData, { type: 'p' }>,
  lane: Lane,
  {
    spState,
    aState,
    availableBuff,
    currentBeat,
  }: Pick<DomainState, 'aState' | 'spState' | 'currentBeat' | 'availableBuff'>
): { triggeredLane: Lane | null } | null => {
  switch (skill.trigger.type) {
    case 'none': {
      // 無条件
      return { triggeredLane: null }
    }
    case 'beat': {
      // 確率10%だが、乱数が絡むので無条件と同等にする
      // TODO: RNGのシードを変えて試せるようにする
      return { triggeredLane: null }
    }
    case 'critical': {
      // 乱数が絡むので無条件と同等にする
      // TODO: RNGのシードを変えて試せるようにする
      return { triggeredLane: null }
    }
    case 'sp': {
      // 誰かがSPスキルは発動時
      const spLane = spState.find((v) => v.skill != null)?.lane
      return spLane === undefined ? null : { triggeredLane: spLane }
    }
    case 'a': {
      // 誰かがAスキル発動時
      const aLane = aState.find((v) => v.skill != null)?.lane
      return aLane === undefined ? null : { triggeredLane: aLane }
    }
    case 'combo': {
      // Xコンボ以上時
      if (currentBeat >= skill.trigger.amount) {
        return { triggeredLane: null }
      }
      return null
    }
    case 'score-up': {
      // 自身がスコアアップ状態の時
      return isBuffedFor(availableBuff, 'score', lane) ? { triggeredLane: null } : null
    }
    case 'critical-up': {
      // 自身がクリティカルアップ状態の時
      return isBuffedFor(availableBuff, 'critical-rate', lane) ? { triggeredLane: null } : null
    }
    case 'anyone-tension-up': {
      // 誰かがテンションアップ状態の時
      const hit = isBuffedFor(availableBuff, 'tension')
      return hit ? { triggeredLane: hit.lane } : null
    }
    case 'anyone-score-up': {
      // 誰かがスコアアップ状態の時
      const hit = isBuffedFor(availableBuff, 'score')
      return hit ? { triggeredLane: hit.lane } : null
    }
    case 'stamina-greater-than': {
      // スタミナがX以上のときは無条件発動にする
      // TODO: 発動タイミングをずらせるUIを追加する
      return { triggeredLane: null }
    }
    default:
      return null
  }
}

const isBuffedFor = (availableBuff: BuffResult, buff: AbilityType, lane?: Lane) =>
  availableBuff.find((v) => (lane === undefined || v.lane === lane) && v.buff === buff)

const extractAvailableBuffResult = (result: Result, { currentBeat }: Pick<DomainState, 'currentBeat'>) =>
  result.filter(isType('buff')).filter((v) => isBuffAvailable(currentBeat, v.beat, v.span))

const isBuffAvailable = (currentBeat: number, beat: number, span: number) =>
  // スキルが発動したビートからバフがかかる
  // バフがかかる最後のビートは、発動ビート + 持続ビート数 - 1
  currentBeat >= beat && currentBeat <= beat + span - 1

const appendBeat =
  (currentBeat: number) =>
  <T>(v: T) => ({ ...v, beat: currentBeat })

/**
 * ライブの長さを考慮してオーバーしないようにspanを調整する。
 * span=1は特別扱いしてライブの最後まで持続するようにする。
 */
const deriveRealSpan = (span: number, liveBeat: number, spanStartBeat: number) =>
  span === 1 ? liveBeat - spanStartBeat + 1 : Math.min(span, liveBeat - spanStartBeat + 1)

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

const appendId = <T>(v: T) => ({ ...v, id: uid() })

function second<T>([, value]: readonly [unknown, T]) {
  return value
}

/**
 * 対象が曖昧な場合に適用されるレーンの優先順序を生成するためのヘルパ
 *
 * センター,センター左,センター右,左端,右端 の順序になる
 *
 * @example
 * [0, 1, 2, 3, 4].sort(comparebyCenter)
 * // => [ 2, 1, 3, 0, 4 ]
 */
function comparebyCenter(a: number, b: number) {
  return Math.abs(1.9 - a) - Math.abs(1.9 - b)
}
