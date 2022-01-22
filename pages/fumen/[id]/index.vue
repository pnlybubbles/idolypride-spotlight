<template>
  <div>
    <h1>{{ live.title }}</h1>
    <div class="sheet">
      <div class="lane" v-for="(lane, i) in lanes" :key="i">
        <div
          class="skill"
          :class="[item.type, { fail: item.fail }]"
          v-for="(item, j) in lane"
          :key="`${i}-${j}`"
          :style="item.style"
        ></div>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import liveData from "../../../data/live";
import idolData from "../../../data/idol";
import { simulate } from './simulate'

const route = useRoute();
// TODO: !
const live = liveData.find((v) => v.id === route.params.id)!;
const SCALE_FACTOR = 5;
const height = `${live.beat * SCALE_FACTOR}px`;

const LANES = [0, 1, 2, 3, 4];
const idolIdbyLane: string[] = [
  "reiTakadai",
  "reiOsorenai",
  "reiTakadai",
  "reiTakadai",
  "reiTakadai",
];
const idol = idolIdbyLane.map((id) => idolData[id])

const { result } = simulate(live, idol)

const lanes = LANES.map((lane) =>
  result
    .filter((v) =>
      v.type === "buff" ? v.lane.includes(lane) : v.lane === lane
    )
    .sort((a, b) => a.beat - b.beat)
    .map((v) => ({
      ...v,
      style: {
        top: `${v.beat * SCALE_FACTOR}px`,
        height: v.type === "buff" ? `${v.span * SCALE_FACTOR}px` : null,
      },
    }))
);
console.log(lanes);
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

.skill {
  --size: 2px;
  --border: 2px;
  position: absolute;
  left: 50%;
  transform: translate(-50%, -50%);
  border-radius: 100%;
  border: var(--border) solid white;

  &.a {
    width: 20px;
    height: 20px;
  }

  &.sp {
    width: 40px;
    height: 40px;
  }

  &.buff {
    border-radius: 999999999px;
    width: calc(var(--size) * 2);
    transform: translate(-50%, calc((var(--size) + var(--border)) * -1));
    border-color: rgba(white, 0.4);
  }

  &.fail {
    border-color: rgba(white, 0.2);
  }
}
</style>
