<template>
  <div
    class="handle"
    :style="swipeStyle"
    @touchstart="handleGuideDragStart"
    @touchmove="handleGuideDragMove"
    @touchend="handleGuideDragEnd"
  >
    <div :class="{ show: deleteActivated }" class="delete"><font-awesome-icon icon="trash" />削除</div>
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
  (e: 'delete'): void
}

const emit = defineEmits<Emits>()

const [scaleFactor] = useFumenScaleFactor()
const DELETE_SWIPE_THRESHOLD = 70

const swipe = ref<number>(0)
const swipeStyle = computed(() => ({
  minWidth: `${Math.min(swipe.value, 80)}px`,
  ...(swipe.value > 0 ? {} : { transition: 'all 0.2s' }),
}))
const deleteActivated = computed(() => swipe.value > DELETE_SWIPE_THRESHOLD)

let guideDragState: {
  startScreenY: number
  startScreenX: number
  startBaet: number
} | null = null

const handleGuideDragStart = (e: TouchEvent) => {
  // 画面の左端部分の操作になるのでiOSのスワイプで戻る操作を無効化する
  e.preventDefault()
  const startScreenY = e.touches[0]?.screenY
  const startScreenX = e.touches[0]?.screenX
  if (startScreenY === undefined || startScreenX === undefined) {
    return
  }
  guideDragState = { startScreenY, startScreenX, startBaet: props.beat }
}

const handleGuideDragMove = (e: TouchEvent) => {
  // スワイプでのスクロール操作を無効化する
  e.preventDefault()
  const screenY = e.touches[0]?.screenY
  const screenX = e.touches[0]?.screenX
  if (guideDragState === null || screenY === undefined || screenX === undefined) {
    return null
  }
  const deltaY = guideDragState.startScreenY - screenY
  const deltaX = guideDragState.startScreenX - screenX
  const beat = guideDragState.startBaet - Math.round(deltaY / scaleFactor.value)
  if (beat !== props.beat) {
    emit('update:beat', clampBeat(beat))
  }
  swipe.value = Math.max(-deltaX, 0)
}

const handleGuideDragEnd = () => {
  if (deleteActivated.value) {
    emit('delete')
  }
  guideDragState = null
  swipe.value = 0
}

const clampBeat = (beat: number) => Math.min(Math.max(beat, 0), props.maxBeat)
</script>
<style lang="scss" scoped>
@import '~~/components/partials/token.scss';

.handle {
  position: relative;
  overflow: hidden;
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
  border-radius: 0 9999px 9999px 0;
  font-size: $typography-m;
}

.delete {
  position: absolute;
  top: 0;
  right: 0;
  height: 100%;
  line-height: 100%;
  width: 100%;
  background-color: darken($error, 35%);
  color: $text1;
  font-size: $typography-s;
  display: grid;
  grid: auto / auto auto;
  justify-content: start;
  align-items: center;
  gap: 2px;
  padding-left: 8px;
  pointer-events: none;
  opacity: 0;
  transition: opacity 0.2s;

  &.show {
    opacity: 1;
  }
}
</style>
