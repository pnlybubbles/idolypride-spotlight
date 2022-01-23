<template>
  <div>
    <h1>{{ live.title }}</h1>
    <div class="sheet">
      <div class="lane guide-lane">
        <div v-for="(guide, i) in guides" :key="i" class="guide" :class="[guide.type]" :style="guide.style">
          <div v-if="guide.type === 'line'" class="handle">{{ guide.num }}</div>
          <div v-else-if="guide.type === 'interval'" class="interval-annotation">{{ guide.num }}</div>
        </div>
      </div>
      <div v-for="(lane, i) in lanes" :key="i" class="lane">
        <template v-for="(item, j) in lane" :key="`${i}-${j}`">
          <div
            v-if="item.type === 'sp'"
            class="sp"
            :class="{ fail: item.fail }"
            :style="item.style"
            @click="tapSP(item)"
          ></div>
          <div
            v-else-if="item.type === 'a'"
            class="a"
            :class="{ fail: item.fail }"
            :style="item.style"
            @click="tapA(item)"
          ></div>
          <div v-else-if="item.type === 'p'" class="p" :style="item.style" @click="tapP(item)"></div>
          <div
            v-else-if="item.type === 'buff'"
            class="buff"
            :class="{ shade: !item.affected }"
            :style="item.style"
          ></div>
        </template>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import liveData from '~/data/live'
import idolData from '~/data/idol'
import { isType, simulate } from './simulate'
import { mapArrayN } from '~~/utils'
import isNonNullable from 'is-non-nullable'
import { theme } from '~~/utils/theme'

const route = useRoute()
// TODO: !
// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
const live = liveData.find((v) => v.id === route.params.id)!
const SCALE_FACTOR = 5
const height = `${live.beat * SCALE_FACTOR}px`
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
    .map(({ interval, ...v }) => (interval ? { ...v, interval } : null))
    .filter(isNonNullable)
    .map(({ interval, prevBeat }) => ({
      type: 'interval' as const,
      num: interval,
      style: { top: `${(prevBeat - interval / 2) * SCALE_FACTOR}px` },
    }))
  return [...lines, ...intervals]
})
const tapSP = (item: Item) => {
  updateGuide(item.beat)
}
const tapA = (item: Item) => {
  updateGuide(item.beat)
}
const tapP = (item: Item) => {
  updateGuide(item.beat)
}
const updateGuide = (beat: number) => {
  const index = beatGuides.value.findIndex((v) => v === beat)
  if (index !== -1) {
    beatGuides.value.splice(index, 1)
  } else {
    beatGuides.value.push(beat)
  }
}

const LANES = [0, 1, 2, 3, 4] as const
const idolIdbyLane = ['reiTakadai', 'reiOsorenai', 'nagisaEmal', 'aoiNureta', 'reiOsorenai'] as const
const idols = mapArrayN(idolIdbyLane, (id) => idolData[id])

const { result } = simulate(live, idols)

type Item = {
  beat: number
  style: { top: string; left?: string; height?: string }
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

const lanes = LANES.map((lane) =>
  result
    .filter((v) => v.lane === lane)
    .sort((a, b) => a.beat - b.beat)
    .map((v) => ({
      ...v,
      style: {
        top: `${v.beat * SCALE_FACTOR}px`,
        '--color': v.buff ? theme.buff[v.buff] : theme.buff.otherwise,
        ...(v.type === 'buff'
          ? {
              height: `${v.span * SCALE_FACTOR}px`,
            }
          : {}),
      },
    }))
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
          style: { ...c.style, left: `calc(50% + ${shift * 10}px)` },
        },
      ]
    }, [] as Item[])
)
</script>
<style lang="scss" scoped>
.sheet {
  height: v-bind(height);
  display: grid;
  grid: auto / 20px repeat(5, auto);
}

.lane + .lane {
  border-left: 1px solid rgba(white, 0.1);
}

.lane {
  position: relative;
}

@mixin skill {
  --border: 2px;
  position: absolute;
  left: 50%;
  transform: translate(-50%, -50%);
  border-radius: 100%;
  border: var(--border) solid var(--color);

  &.fail {
    border-color: red;
    background: repeating-linear-gradient(45deg, red, red 2px, transparent 2px, transparent 6px);
  }
}

.a {
  @include skill;
  width: 20px;
  height: 20px;
  z-index: 1;
}

.p {
  @include skill;
  width: 8px;
  height: 8px;
  z-index: 1;
}

.sp {
  @include skill;
  width: 40px;
  height: 40px;
  z-index: 1;
}

.buff {
  --size: 2px;
  position: absolute;
  left: 50%;
  border-radius: 999999999px;
  width: calc(var(--size) * 2);
  transform: translate(-50%, calc(var(--size) * -1));
  border: none;
  background-color: var(--color);
  opacity: 0.4;
  z-index: 0;

  &.shade {
    background: repeating-linear-gradient(45deg, var(--color), var(--color) 2px, transparent 2px, transparent 4px);
  }
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
