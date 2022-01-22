<template>
  <div>
    <h1>{{ live.title }}</h1>
    <div class="sheet">
      <div class="lane guide-lane">
        <div v-for="guide in guides" :key="guide.beat" class="guide" :style="guide.style">
          <div class="handle">{{ guide.beat }}</div>
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
          <div v-else-if="item.type === 'p'" class="p" :style="item.style"></div>
          <div v-else-if="item.type === 'buff'" class="buff" :style="item.style"></div>
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

const route = useRoute()
// TODO: !
// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
const live = liveData.find((v) => v.id === route.params.id)!
const SCALE_FACTOR = 5
const height = `${live.beat * SCALE_FACTOR}px`
const beatGuides = ref<number[]>([])
const guides = computed(() => beatGuides.value.map((beat) => ({ beat, style: { top: `${beat * SCALE_FACTOR}px` } })))
const tapSP = (item: Item) => {
  updateGuide(item.beat)
}
const tapA = (item: Item) => {
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
      span: number
      shift: number
    }
)

const lanes = LANES.map((lane) =>
  result
    .filter((v) => (v.type === 'buff' ? v.lanes.includes(lane) : v.lane === lane))
    .sort((a, b) => a.beat - b.beat)
    .map((v) => ({
      ...v,
      style: {
        top: `${v.beat * SCALE_FACTOR}px`,
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
  border-left: 1px solid #333;
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
  border: var(--border) solid white;

  &.fail {
    border-color: red;
    background: repeating-linear-gradient(45deg, red, red 2px, rgba(red, 0) 2px, rgba(red, 0) 6px);
  }
}

.a {
  @include skill;
  width: 20px;
  height: 20px;
}

.p {
  @include skill;
  width: 4px;
  height: 4px;
}

.sp {
  @include skill;
  width: 40px;
  height: 40px;
}

.buff {
  @include skill;
  --size: 2px;
  border-radius: 999999999px;
  width: calc(var(--size) * 2);
  transform: translate(-50%, calc(var(--size) * -1));
  border: none;
  background-color: rgba(white, 0.4);
}

.guide-lane {
  z-index: 1;
}

.guide {
  position: absolute;
  border-top: solid 1px rgba(white, 0.2);
  width: 100vw;
  display: flex;
}

.handle {
  box-sizing: border-box;
  padding: 4px;
  transform: translateY(-50%);
  z-index: 1;
  background-color: black;
  border: solid 1px rgba(white, 0.2);
  border-left: none;
}
</style>
