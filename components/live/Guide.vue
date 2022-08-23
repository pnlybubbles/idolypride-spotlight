<template>
  <div class="guide" @click.self="addGuide" @touchend="null">
    <div v-for="item in beatGuides" :key="item.id" class="line" :style="lineStyle(item.beat)">
      <GuideHandle v-model:beat="item.beat" :max-beat="maxBeat" @delete="deleteGuide(item.id)"></GuideHandle>
    </div>
    <div v-for="(interval, i) in intervals" :key="i" class="interval-annotation" :style="interval.style">
      {{ interval.num }}
    </div>
  </div>
</template>
<script setup lang="ts">
import isNonNullable from 'is-non-nullable'
import { useFumenScaleFactor } from '~~/composable/localstorage-descriptors'
import { uid } from '~~/utils'
import GuideHandle from './GuideHandle.vue'

interface Props {
  maxBeat: number
}

const props = defineProps<Props>()

const [scaleFactor] = useFumenScaleFactor()
const beatGuides = ref<{ beat: number; id: string }[]>([])

const lineStyle = (beat: number) => ({
  top: `${beat * scaleFactor.value}px`,
})

const intervals = computed(() =>
  [...beatGuides.value]
    .sort((a, b) => a.beat - b.beat)
    .reduce((acc, v) => {
      const prev = acc[acc.length - 1]
      return prev
        ? [...acc, { prevBeat: v.beat, interval: v.beat - prev.prevBeat }]
        : [...acc, { prevBeat: v.beat, interval: null }]
    }, [] as { interval: number | null; prevBeat: number }[])
    .map(({ interval, ...v }) => (interval != null ? { ...v, interval } : null))
    .filter(isNonNullable)
    .map(({ interval, prevBeat }) => ({
      num: interval,
      style: { top: `${(prevBeat - interval / 2) * scaleFactor.value}px` },
    }))
)

const addGuide = (e: MouseEvent) => {
  const beat = clampBeat(Math.round(e.offsetY / scaleFactor.value))
  beatGuides.value.push({ id: uid(), beat })
}

const deleteGuide = (id: string) => {
  const index = beatGuides.value.findIndex((v) => v.id === id)
  if (index !== -1) {
    beatGuides.value.splice(index, 1)
  }
}

const clampBeat = (beat: number) => Math.min(Math.max(beat, 0), props.maxBeat)
</script>
<style lang="scss" scoped>
@import '~~/components/partials/token.scss';

.guide {
  position: relative;
}

.line {
  position: absolute;
  width: 100vw;
  display: flex;
  pointer-events: none;
  border-top: solid 1px rgba(white, 0.2);
}

.interval-annotation {
  z-index: 1;
  position: absolute;
  padding: 4px;
  transform: translateY(-50%);
  color: $text3;
  font-weight: bold;
  font-size: $typography-xs;
  pointer-events: none;
}
</style>
