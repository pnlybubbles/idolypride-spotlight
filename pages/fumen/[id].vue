<template>
  <div>
    <h1>{{ data.title }}</h1>
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
import musicData from "../../data/music";
import idolData, { Skill } from "../../data/idol";
import isNonNullable from "is-non-nullable";

const route = useRoute();
// TODO: !
const data = musicData.find((v) => v.id === route.params.id)!;
const SCALE_FACTOR = 5;
const height = `${data.beat * SCALE_FACTOR}px`;

type Result = ({
  beat: number;
} & (
  | {
      type: "sp" | "a" | "p";
      lane: number;
      fail: boolean;
    }
  | {
      type: "buff";
      lane: number[];
      span: number;
    }
))[];

type State = {
  lane: number; // スキルが発生したレーン
  beat: number; // スキルが発生したビート
  skill: Skill | null; // アイドルのスキル, nullのときは失敗
}[];

const LANES = [0, 1, 2, 3, 4];
const idolIdbyLane: (keyof typeof idolData)[] = [
  "rei_hojoken",
  "rei_jinken",
  "rei_hojoken",
  "rei_hojoken",
  "rei_hojoken",
];
const idol = idolIdbyLane
  .map((id) => idolData[id])
  .map((v) => ({
    ...v,
    skills: v.skills.map((w, index) => ({ ...w, index })),
  }));

const BEATS = new Array(data.beat).fill(0).map((_, i) => i);
const { result, state } = BEATS.reduce(
  ({ result, state }, currentBeat) => {
    // Aスキルの発動チェック
    const aState: State = data.a
      .map((laneData, lane) => {
        // いまのビートがAのタイミングかどうかをチェック
        const skillTiming = laneData.find((beat) => beat === currentBeat);
        if (skillTiming === undefined) {
          return null;
        }
        // アイドルが発動可能なAスキルを持っているかをチェック
        // アイドルの過去に発動したAスキルのうちCT中のもの
        const aSkillsCT = state
          .map((v) => (v.skill === null ? null : { ...v, skill: v.skill }))
          .filter(isNonNullable)
          .filter(
            (v) =>
              v.lane === lane &&
              v.skill?.type === "a" &&
              v.beat + v.skill.ct >= currentBeat
          );
        if (lane === 3) {
          console.log('ct', aSkillsCT)
        }
        // 発動可能なAスキルを絞り込む
        const aSkillCanTrigger = idol[lane].skills.filter((skill) =>
          !aSkillsCT.map((v) => v.skill.index).includes(skill.index)
        ).filter(v => v.type === 'a');
        if (lane === 3) {
          console.log('can', aSkillCanTrigger)
        }
        const aSkillHead = aSkillCanTrigger.length > 0 ? aSkillCanTrigger[0] : null
        return { lane, beat: currentBeat, skill: aSkillHead };
      })
      .filter(isNonNullable);
    const aResult: Result = aState.map(({ lane, skill }) => ({
      type: "a" as const,
      beat: currentBeat,
      lane: lane,
      fail: skill === null,
    }));

    // Aスキルによるバフ
    const aBuffResult: Result = aState
      .map(({ lane, skill }) =>
        skill !== null
          ? {
              type: "buff" as const,
              beat: currentBeat,
              lane: LANES,
              span: skill.span,
            }
          : null
      )
      .filter(isNonNullable);

    // SPスキルの発動チェック
    const spState: State = data.sp
      .map((laneData, lane) => {
        // いまのビートがSPのタイミングかどうかをチェック
        const skillTiming = laneData.find((beat) => beat === currentBeat);
        if (skillTiming === undefined) {
          return null;
        }
        // アイドルがSPを持っているかどうかをチェック
        const skill = idol[lane].skills.find((skill) => skill.type === "sp");
        if (skill === undefined) {
          return { lane, beat: currentBeat, skill: null };
        }
        return { lane, beat: currentBeat, skill };
      })
      .filter(isNonNullable);
    const spResult: Result = spState.map(({ lane, skill }) => ({
      type: "sp" as const,
      beat: currentBeat,
      lane: lane,
      fail: skill === null,
    }));

    return {
      result: [...result, ...aResult, ...[], ...spResult],
      state: [...state, ...aState, ...spState],
    };
  },
  { result: [] as Result, state: [] as State }
);
console.log(result, state);
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
