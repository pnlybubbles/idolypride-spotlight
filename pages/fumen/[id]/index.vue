<template>
  <div>
    <h1>{{ live.title }}</h1>
    <div class="sheet">
      <div v-for="(lane, i) in lanes" :key="i" class="lane">
        <template v-for="(item, j) in lane" :key="`${i}-${j}`">
          <div v-if="item.type === 'sp'" class="sp" :class="{ fail: item.fail }" :style="item.style"></div>
          <div v-else-if="item.type === 'a'" class="a" :class="{ fail: item.fail }" :style="item.style"></div>
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
import { simulate } from './simulate'
import { mapArrayN } from '~~/utils'

const route = useRoute()
// TODO: !
// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
const live = liveData.find((v) => v.id === route.params.id)!
const SCALE_FACTOR = 5
const height = `${live.beat * SCALE_FACTOR}px`

const LANES = [0, 1, 2, 3, 4] as const
const idolIdbyLane = ['reiTakadai', 'reiOsorenai', 'nagisaEmal', 'aoiNureta', 'reiOsorenai'] as const
const idol = mapArrayN(idolIdbyLane, (id) => idolData[id])

const { result } = simulate(live, idol)

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
)
</script>
<style lang="scss" scoped>
.sheet {
  height: v-bind(height);
  display: grid;
  grid: auto / repeat(5, auto);
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
}

.a {
  @include skill;
  width: 20px;
  height: 20px;
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
  transform: translate(-50%, calc((var(--size) + var(--border)) * -1));
  border-color: rgba(white, 0.4);
}

.fail {
  @include skill;
  border-color: rgba(white, 0.2);
}
</style>
