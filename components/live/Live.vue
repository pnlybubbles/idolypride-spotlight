<template>
  <div class="sheet">
    <LiveGuide class="lane guide-lane" :max-beat="beat"></LiveGuide>
    <div v-for="i in LANES" :key="i" class="lane live-lane">
      <template v-for="item in lanes[i]" :key="item.id">
        <LiveSkill
          v-if="item.type === 'sp' || item.type === 'a' || item.type === 'p'"
          :beat="item.beat"
          :buff="item.buff"
          :variant="item.type"
          :skill="getSkill(i, item.index)"
          :lane="i"
          :gap="item.type === 'sp' || item.type === 'a' ? item.gap : null"
          :affected="item.type === 'sp' || item.type === 'a' ? item.affected : []"
          :activated="item.activated"
          @long-press="handleLongPress(item.id)"
          @release="handleRelease"
        ></LiveSkill>
        <LiveBuff
          v-else-if="item.type === 'buff'"
          :beat="item.beat"
          :buff="item.buff"
          :affected="item.affecting"
          :span="item.span"
          :shift="item.shift"
          :highlighted="highlighted === item.activatedBy"
        ></LiveBuff>
      </template>
    </div>
  </div>
</template>
<script setup lang="ts">
import { isType, simulate } from './simulate'
import { ArrayN, unreachable } from '~~/utils'
import { AbilityType, BuffAbilityType, IdolData, Lane, LiveData, SkillIndex, LaneConfig } from '~~/utils/types'
import { LANES, px } from '~~/utils/common'
import { useFumenScaleFactor } from '~~/composable/localstorage-descriptors'
import cloneDeep from 'clone-deep'
import { pickSkillsByLevel } from '~~/utils/formatter'

interface Props {
  live: LiveData
  laneConfig: LaneConfig
  idols: ArrayN<IdolData | null, 5>
}

const props = defineProps<Props>()

const [scaleFactor] = useFumenScaleFactor()
const beat = computed(() => props.live.beat)

const getSkill = (lane: Lane, skillIndex: SkillIndex | undefined) => {
  const idol = props.idols[lane]
  if (!idol) {
    return undefined
  }
  return pickSkillsByLevel(idol.skills, idol.owned?.skillLevels ?? undefined).find((v) => v.index === skillIndex)
}

// immerのProxyと干渉するので生objectに戻す
// toRawではネストが深くて戻しきれないのでcloneDeepで無理やり再帰的に戻す
const simulated = computed(() => simulate(props.live, cloneDeep(props.idols), props.laneConfig))

type Item = {
  id: string
  beat: number
  buff: AbilityType
} & (
  | {
      type: 'sp' | 'a'
      index: SkillIndex | undefined
      fail: boolean
      affected: { type: BuffAbilityType; amount: number }[]
      activated: { abilityId: string; type: BuffAbilityType; amount: number }[]
      gap: number | null
    }
  | {
      type: 'p'
      index: SkillIndex
      activated: { abilityId: string; type: BuffAbilityType; amount: number }[]
    }
  | {
      type: 'buff'
      affecting: boolean
      activatedBy: string
      span: number
      shift: number
    }
)

const lanes = computed(() => {
  // ビート数が多い順にソートしておく(findで先頭から探したいので)
  const spBeats = simulated.value.result
    .filter((v) => v.type === 'sp')
    .map((v) => v.beat)
    .sort()
    .reverse()
  return LANES.map((lane) =>
    simulated.value.result
      .filter((v) => v.lane === lane)
      .sort((a, b) => a.beat - b.beat)
      .reduce((acc, c) => {
        if (c.type === 'sp') {
          // SPの場合はビート間隔計算をレーンまたいで行う
          const prevBeat = spBeats.find((v) => v < c.beat)
          const gap = prevBeat !== undefined ? c.beat - prevBeat : null
          const item = { ...c, gap }
          // アイドルが未選択の場合はシミュレート結果のスキル失敗を打ち消す
          return [...acc, props.idols[lane] == null ? { ...item, fail: false } : item]
        } else if (c.type === 'a') {
          // Aスキルの場合は同一レーンでのみビート間隔計算する
          const prevBeat = acc
            .filter((v) => v.type === c.type)
            .map((v) => v.beat)
            .reduce((max, v) => Math.max(max ?? 0, v), null as null | number)
          const gap = prevBeat !== null ? c.beat - prevBeat : null
          const item = { ...c, gap }
          // アイドルが未選択の場合はシミュレート結果のスキル失敗を打ち消す
          return [...acc, props.idols[lane] == null ? { ...item, fail: false } : item]
        } else if (c.type === 'p') {
          return [...acc, c]
        } else if (c.type === 'buff') {
          const occupiedShift = acc
            .filter(isType('buff'))
            .filter((v) => v.beat + v.span >= c.beat)
            .map((v) => v.shift)
          const availableShift = new Array(occupiedShift.reduce((p, c) => Math.max(p, c), 0) + 2)
            .fill(null)
            .map((_, i) => i)
            .filter((v) => !occupiedShift.includes(v))
          const shift = availableShift[0] ?? 0
          return [
            ...acc,
            {
              ...c,
              shift,
            },
          ]
        } else {
          return unreachable(c.type)
        }
      }, [] as Item[])
  )
})

const highlighted = ref<string | null>(null)

const handleLongPress = (id: string) =>
  (highlighted.value = simulated.value.result.find((v) => v.id === id)?.id ?? null)

const handleRelease = () => (highlighted.value = null)

const height = computed(() => px(beat.value * scaleFactor.value))
</script>
<style lang="scss" scoped>
@import '~~/components/partials/token.scss';

.sheet {
  @include lane-grid;
  height: v-bind(height);
  user-select: none;
  position: relative;
  z-index: 0;
}

.lane + .lane {
  border-left: 1px solid rgba(white, 0.1);
}

.live-lane {
  position: relative;
}

.guide-lane {
  z-index: 1;
}
</style>
