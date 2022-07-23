<template>
  <div class="sheet">
    <div class="lane guide-lane">
      <div v-for="(guide, i) in guides" :key="i" class="guide" :class="[guide.type]" :style="guide.style">
        <div v-if="guide.type === 'line'" class="handle">{{ guide.num }}</div>
        <div v-else-if="guide.type === 'interval'" class="interval-annotation">{{ guide.num }}</div>
      </div>
    </div>
    <div v-for="i in LANES" :key="i" class="lane">
      <template v-for="item in lanes[i]" :key="item.id">
        <LiveSkill
          v-if="item.type === 'sp' || item.type === 'a' || item.type === 'p'"
          :variant="item.type"
          v-bind="item"
          :skill="getSkill(i, item.index)"
          :lane="i"
          @long-press="updateGuide(item.beat)"
        ></LiveSkill>
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
import { isType, simulate } from './simulate'
import { ArrayN } from '~~/utils'
import isNonNullable from 'is-non-nullable'
import { AbilityType, BuffAbilityType, IdolData, Lane, LiveData, SkillIndex } from '~~/utils/types'
import { LANES, px } from '~~/utils/common'
import { useFumenScaleFactor } from '~~/composable/localstorage-descriptors'
import cloneDeep from 'clone-deep'

interface Props {
  live: LiveData
  idols: ArrayN<IdolData | null, 5>
}

const props = defineProps<Props>()

const [scaleFactor] = useFumenScaleFactor()
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
      style: { top: `${beat * scaleFactor.value}px` },
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
      style: { top: `${(prevBeat - interval / 2) * scaleFactor.value}px` },
    }))
  return [...lines, ...intervals]
})

const updateGuide = (beat: number) => {
  const index = beatGuides.value.findIndex((v) => v === beat)
  if (index !== -1) {
    beatGuides.value.splice(index, 1)
  } else {
    beatGuides.value.push(beat)
  }
}

const getSkill = (lane: Lane, skillIndex: SkillIndex | undefined) =>
  props.idols[lane]?.skills.find((v) => v.index === skillIndex)

// immerのProxyと干渉するので生objectに戻す
// toRawではネストが深くて戻しきれないのでcloneDeepで無理やり再帰的に戻す
const simulated = computed(() => simulate(props.live, cloneDeep(props.idols)))

type Item = {
  id: string
  beat: number
  buff: AbilityType
} & (
  | {
      type: 'sp' | 'a'
      index: SkillIndex | undefined
      fail: boolean
      activated: { type: BuffAbilityType; amount: number }[]
    }
  | {
      type: 'p'
      index: SkillIndex
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
          // アイドルが未選択の場合はシミュレート結果のスキル失敗を打ち消す
          return [...acc, props.idols[lane] == null ? { ...c, fail: false } : c]
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
  )
)

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
  padding: 5px 6px 4px 3px;
  transform: translateY(-50%);
  z-index: 1;
  background-color: black;
  border: solid 1px $text3;
  border-left: none;
  font-weight: bold;
  color: $text3;
  pointer-events: auto;
  border-radius: 0 50% 50% 0;
  font-size: $typography-m;
}

.interval-annotation {
  z-index: 1;
  padding: 4px;
  transform: translateY(-50%);
  color: $text3;
  font-weight: bold;
  font-size: $typography-s;
  pointer-events: auto;
}
</style>
