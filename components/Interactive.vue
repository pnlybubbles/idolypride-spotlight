<template>
  <button
    class="interactive"
    :disabled="disabled"
    @click="handleClick"
    @touchstart="handleTouchStart"
    @touchend="handleTouchEnd"
  >
    <slot></slot>
  </button>
</template>
<script setup lang="ts">
const LONG_PRESS_THREASHOLD = 300 // ms

interface Props {
  disabled?: boolean
}
withDefaults(defineProps<Props>(), { disabled: false })

interface Emits {
  // TODO: こっちもTouchEventにする
  (e: 'click', event: MouseEvent): void
  (e: 'longPress', event: TouchEvent): void
}
const emit = defineEmits<Emits>()

const handleContextMenu = (e: MouseEvent) => e.preventDefault()

let touchTimer: NodeJS.Timeout | null = null
let isLongPress = false

const handleTouchStart = (e: TouchEvent) => {
  isLongPress = false
  touchTimer = setTimeout(() => {
    // NOTE: 非同期でemitしてるのでもしかしたら longPress.stop の修飾子は意味ない感じになるかも
    emit('longPress', e)
    isLongPress = true
  }, LONG_PRESS_THREASHOLD)
  // iOSで長押し中にテキストの選択が起こる問題を抑制する
  document.body.style.webkitUserSelect = 'none'
  // macOSで長押しで右クリックメニューが表示される問題を抑制する
  document.addEventListener('contextmenu', handleContextMenu)
}

const handleTouchEnd = () => {
  cleanup()
  if (touchTimer) clearTimeout(touchTimer)
}

const handleClick = (e: MouseEvent) => {
  if (isLongPress) return
  emit('click', e)
}

const cleanup = () => {
  document.body.style.webkitUserSelect = ''
  document.removeEventListener('contextmenu', handleContextMenu)
}

onUnmounted(cleanup)
</script>
<style lang="scss" scoped>
@import '~~/components/partials/utils.scss';

.interactive {
  @include reset-button;
  @include clickable;
}
</style>
