<template>
  <div class="sheet">
    <div class="lane guide-lane">
      <div v-for="(guide, i) in guides" :key="i" class="guide" :class="[guide.type]" :style="guide.style">
        <div v-if="guide.type === 'line'" class="handle">{{ guide.num }}</div>
        <div v-else-if="guide.type === 'interval'" class="interval-annotation">{{ guide.num }}</div>
      </div>
    </div>
    <div v-for="(lane, i) in lanes" :key="i" class="lane">
      <template v-for="item in lane" :key="item.id">
        <LiveSPSkill v-if="item.type === 'sp'" :beat="item.beat" :buff="item.buff" :fail="item.fail"></LiveSPSkill>
        <LiveASkill v-else-if="item.type === 'a'" :beat="item.beat" :buff="item.buff" :fail="item.fail"></LiveASkill>
        <LivePSkill v-else-if="item.type === 'p'" :beat="item.beat" :buff="item.buff"></LivePSkill>
        <LiveBuff
          v-else-if="item.type === 'buff'"
          :beat="item.beat"
          :buff="item.buff"
          :affected="item.affected"
          :span="item.span"
          :shift="item.shift"
        ></LiveBuff>
      </template>
    </div>
  </div>
</template>
<script setup lang="ts">
import idolData from '~~/data/idol'
import { isType, simulate } from './simulate'
import { mapArrayN } from '~~/utils'
import isNonNullable from 'is-non-nullable'
import { BuffType, LiveData } from '~~/utils/types'

interface Props {
  live: LiveData
}

const props = defineProps<Props>()

const SCALE_FACTOR = 5
const beat = computed(() => props.live.beat)
const beatGuides = ref<number[]>([])
type GuideProps = {
  style: { top: string }
} & (
  | {
      type: 'line'
      num: number
    }
  | {
      type: 'interval'
      num: number
    }
)
const guides = computed<GuideProps[]>(() => {
  const lines = [
    ...beatGuides.value.map((beat) => ({
      type: 'line' as const,
      num: beat,
      style: { top: `${beat * SCALE_FACTOR}px` },
    })),
  ].sort((a, b) => a.num - b.num)
  const intervals = lines
    .reduce((acc, v) => {
      const prev = acc[acc.length - 1]
      return prev
        ? [...acc, { prevBeat: v.num, interval: v.num - prev.prevBeat }]
        : [...acc, { prevBeat: v.num, interval: null }]
    }, [] as { interval: number | null; prevBeat: number }[])
    .map(({ interval, ...v }) => (interval != null ? { ...v, interval } : null))
    .filter(isNonNullable)
    .map(({ interval, prevBeat }) => ({
      type: 'interval' as const,
      num: interval,
      style: { top: `${(prevBeat - interval / 2) * SCALE_FACTOR}px` },
    }))
  return [...lines, ...intervals]
})
// const tapSP = (item: Item) => {
//   updateGuide(item.beat)
// }
// const tapA = (item: Item) => {
//   updateGuide(item.beat)
// }
// const tapP = (item: Item) => {
//   updateGuide(item.beat)
// }
// const updateGuide = (beat: number) => {
//   const index = beatGuides.value.findIndex((v) => v === beat)
//   if (index !== -1) {
//     beatGuides.value.splice(index, 1)
//   } else {
//     beatGuides.value.push(beat)
//   }
// }

const LANES = [0, 1, 2, 3, 4] as const
const idolIdbyLane = ['reiTakadai', 'reiOsorenai', 'nagisaEmal', 'aoiNureta', 'reiOsorenai'] as const
const idols = mapArrayN(idolIdbyLane, (id) => idolData[id])

const simulated = computed(() => simulate(props.live, idols))

type Item = {
  id: string
  beat: number
  buff: BuffType
} & (
  | {
      type: 'sp' | 'a'
      fail: boolean
    }
  | {
      type: 'p'
    }
  | {
      type: 'buff'
      affected: boolean
      span: number
      shift: number
    }
)

const lanes = computed(() =>
  LANES.map((lane) =>
    simulated.value.result
      .filter((v) => v.lane === lane)
      .sort((a, b) => a.beat - b.beat)
      .reduce((acc, c) => {
        if (c.type !== 'buff') {
          return [...acc, c]
        }
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
      }, [] as Item[])
      // TODO: いったん動作確認のためにアイドルの行動は非表示
      .map((v) => (v.type === 'sp' || v.type === 'a' ? { ...v, buff: 'unknown' as const, fail: false } : v))
      .filter((v) => v.type === 'sp' || v.type === 'a')
  )
)
</script>
<style lang="scss" scoped>
@import '~/utils/variables.scss';

.sheet {
  height: calc(v-bind(beat) * $scale-factor);
  display: grid;
  grid: auto / 20px repeat(5, auto);
}

.lane + .lane {
  border-left: 1px solid rgba(white, 0.1);
}

.lane {
  position: relative;
}

.guide-lane {
  z-index: 1;
}

.guide {
  position: absolute;
  width: 100vw;
  display: flex;
  pointer-events: none;

  &.line {
    border-top: solid 1px rgba(white, 0.2);
  }
}

.handle {
  box-sizing: border-box;
  padding: 4px;
  transform: translateY(-50%);
  z-index: 1;
  background-color: black;
  border: solid 1px rgba(white, 0.2);
  border-left: none;
  font-weight: bold;
  color: rgba(white, 0.2);
  pointer-events: auto;
}

.interval-annotation {
  z-index: 1;
  padding: 4px;
  transform: translateY(-50%);
  color: rgba(white, 0.2);
  font-weight: bold;
  font-size: 12px;
  pointer-events: auto;
}
</style>
