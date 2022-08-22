<template>
  <div
    class="handle"
    @touchstart="handleGuideDragStart"
    @touchmove="handleGuideDragMove"
    @touchend="handleGuideDragEnd"
  >
    {{ beat }}
  </div>
</template>
<script setup lang="ts">
import { useFumenScaleFactor } from '~~/composable/localstorage-descriptors'

interface Props {
  beat: number
  maxBeat: number
}

const props = defineProps<Props>()

interface Emits {
  (e: 'update:beat', value: number): void
}

const emit = defineEmits<Emits>()

const [scaleFactor] = useFumenScaleFactor()

let guideDragState: {
  startScreenY: number
  startBaet: number
} | null = null

const handleGuideDragStart = (e: TouchEvent) => {
  const startScreenY = e.touches[0]?.screenY
  if (startScreenY === undefined) {
    return
  }
  guideDragState = { startScreenY, startBaet: props.beat }
}

const handleGuideDragMove = (e: TouchEvent) => {
  e.preventDefault()
  const screenY = e.touches[0]?.screenY
  if (guideDragState === null || screenY === undefined) {
    return null
  }
  const delta = guideDragState.startScreenY - screenY
  const beat = guideDragState.startBaet - Math.round(delta / scaleFactor.value)
  emit('update:beat', clampBeat(beat))
}

const handleGuideDragEnd = () => {
  guideDragState = null
}

const clampBeat = (beat: number) => Math.min(Math.max(beat, 0), props.maxBeat)
</script>
<style lang="scss" scoped></style>
