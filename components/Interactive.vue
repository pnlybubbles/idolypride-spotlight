<template>
  <button
    class="interactive"
    :disabled="disabled"
    @click="$emit('click')"
    @touchstart="handleTouchStart"
    @touchend="handleTouchEnd"
  >
    <slot></slot>
  </button>
</template>
<script setup lang="ts">
const LONG_PRESS_THREASHOLD = 500 // ms

interface Props {
  disabled?: boolean
}
withDefaults(defineProps<Props>(), { disabled: false })

interface Emits {
  (e: 'click'): void
  (e: 'longPress'): void
}
const emit = defineEmits<Emits>()

let touchTimer: NodeJS.Timeout | null = null
const handleTouchStart = () => {
  touchTimer = setTimeout(() => emit('longPress'), LONG_PRESS_THREASHOLD)
}
const handleTouchEnd = () => touchTimer && clearTimeout(touchTimer)
</script>
<style lang="scss" scoped>
@import '~~/components/partials/utils.scss';

.interactive {
  @include reset-button;
  @include clickable;
}
</style>
