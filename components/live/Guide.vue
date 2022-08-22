<template>
  <div class="guide-root" @click.self="addGuide" @touchend="null">
    <div v-for="(guide, i) in guides" :key="i" class="guide" :class="[guide.type]" :style="guide.style">
      <div
        v-if="guide.type === 'line'"
        class="handle"
        @touchstart="handleGuideDragStart($event, guide.num)"
        @touchmove="handleGuideDragMove"
        @touchend="handleGuideDragEnd"
      >
        {{ guide.num }}
      </div>
      <div v-else-if="guide.type === 'interval'" class="interval-annotation">{{ guide.num }}</div>
    </div>
  </div>
</template>
<script setup lang="ts">
import isNonNullable from 'is-non-nullable'
import { useFumenScaleFactor } from '~~/composable/localstorage-descriptors'

interface Props {
  maxBeat: number
}

const props = defineProps<Props>()

const [scaleFactor] = useFumenScaleFactor()
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

const addGuide = (e: MouseEvent) => {
  const num = clampBeat(Math.round(e.offsetY / scaleFactor.value))
  if (beatGuides.value.indexOf(num) === -1) {
    beatGuides.value.push(num)
  }
}

let guideDragState: {
  startScreenY: number
  startNum: number
  guideIndex: number
} | null = null

const handleGuideDragStart = (e: TouchEvent, beat: number) => {
  const guideIndex = beatGuides.value.findIndex((v) => v === beat)
  const startScreenY = e.touches[0]?.screenY
  const startNum = beatGuides.value[guideIndex]
  if (startScreenY === undefined || startNum === undefined) {
    return
  }
  guideDragState = { startScreenY, startNum, guideIndex }
}

const handleGuideDragMove = (e: TouchEvent) => {
  e.preventDefault()
  const screenY = e.touches[0]?.screenY
  if (guideDragState === null || screenY === undefined) {
    return null
  }
  const delta = guideDragState.startScreenY - screenY
  const num = clampBeat(guideDragState.startNum - Math.round(delta / scaleFactor.value))
  if (beatGuides.value.indexOf(num) === -1) {
    beatGuides.value[guideDragState.guideIndex] = num
  }
}

const handleGuideDragEnd = () => {
  guideDragState = null
}

const clampBeat = (beat: number) => Math.min(Math.max(beat, 0), props.maxBeat)
</script>
<style lang="scss" scoped>
@import '~~/components/partials/token.scss';

.guide-root {
  position: relative;
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
  font-size: $typography-xs;
  pointer-events: auto;
}
</style>
