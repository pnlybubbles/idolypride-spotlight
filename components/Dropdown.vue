<template>
  <div ref="anchorRef" class="dropdown">
    <slot></slot>
    <div v-if="present" ref="hoveredRef" class="select">
      <button
        v-for="item in options"
        :key="item.value"
        class="option"
        @click.stop="handleSelect(item.value)"
        @touchend="null"
      >
        {{ item.label }}
      </button>
    </div>
  </div>
</template>
<script setup lang="ts">
import { px } from '~~/utils/common'

interface Item {
  label: string
  value: string
}

interface Props {
  present: boolean
  options: readonly Item[]
}

const props = defineProps<Props>()

interface Emits {
  (e: 'update:present', value: boolean): void
  (e: 'select', value: string): void
}

const emit = defineEmits<Emits>()

const handleSelect = (value: string) => {
  emit('update:present', false)
  emit('select', value)
}

const listener = () => {
  if (props.present) {
    emit('update:present', false)
  }
}

onMounted(() => window.addEventListener('click', listener))
onUnmounted(() => window.removeEventListener('click', listener))

const anchorRef = ref<HTMLDivElement | null>(null)
const hoveredRef = ref<HTMLDivElement | null>(null)
const HOVERED_SAFE_AREA = 8
const measureHoveredOffset = () => {
  if (hoveredRef.value === null || anchorRef.value === null) {
    return { x: 0, y: 0 }
  }
  const rootRect = { width: document.documentElement.clientWidth, height: document.documentElement.clientHeight }
  const anchorRect = anchorRef.value.getBoundingClientRect()
  const rect = hoveredRef.value.getBoundingClientRect()
  const absoluteLimit = {
    x: rootRect.width - rect.width - HOVERED_SAFE_AREA,
    y: rootRect.height - rect.height - HOVERED_SAFE_AREA,
  }
  return {
    x: Math.min(absoluteLimit.x - anchorRect.left, 0),
    y: Math.min(absoluteLimit.y - anchorRect.bottom, 0),
  }
}

const hoveredOffset = ref({ x: '0', y: '0' })
watchEffect(() => {
  if (!props.present) {
    return
  }
  const derived = measureHoveredOffset()
  hoveredOffset.value = { x: px(derived.x), y: px(derived.y) }
})
</script>
<style lang="scss" scoped>
@import '~~/components/partials/token.scss';
@import '~~/components/partials/utils.scss';

.dropdown {
  position: relative;
}

.select {
  @include round-corner;
  @include background-blur;
  position: absolute;
  top: calc(100% + v-bind('hoveredOffset.y'));
  left: v-bind('hoveredOffset.x');
  background-color: $surface2;
  display: grid;
  padding: 4px 0;
  gap: 1px;
}

.option {
  @include reset-button;
  @include clickable;
  font-size: $typography-s;
  color: $text4;
  padding: 6px 16px;
  white-space: nowrap;
  position: relative;
  text-align: left;

  & + & {
    &::before {
      content: '';
      display: block;
      position: absolute;
      top: -1px;
      left: 50%;
      width: calc(100% - 16px);
      transform: translateX(-50%);
      border-top: solid 1px $surface2-stroke;
    }
  }
}
</style>
