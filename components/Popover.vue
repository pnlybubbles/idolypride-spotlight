<template>
  <div ref="anchorRef" class="anchor">
    <slot name="anchor"></slot>
    <div v-show="present" ref="hoveredRef" class="popover">
      <slot></slot>
    </div>
  </div>
</template>
<script setup lang="ts">
import { px } from '~~/utils/common'

interface Props {
  present: boolean
  offset?: number
}
const props = withDefaults(defineProps<Props>(), { offset: 20 })

interface Emits {
  (e: 'update:present', value: boolean): void
}
defineEmits<Emits>()

const offset = computed(() => px(props.offset))

const anchorRef = ref<HTMLDivElement | null>(null)
const hoveredRef = ref<HTMLDivElement | null>(null)
const HOVERED_SAFE_AREA = 8
const measureHoveredOffset = () => {
  if (hoveredRef.value === null || anchorRef.value === null) {
    return 0
  }
  const rootRect = { width: document.documentElement.clientWidth, height: document.documentElement.clientHeight }
  const anchorRect = anchorRef.value.getBoundingClientRect()
  const rect = hoveredRef.value.getBoundingClientRect()
  // hoveredRefの左端がとり得る絶対座標の最大値,最小値
  const absoluteMax = rootRect.width - rect.width - HOVERED_SAFE_AREA
  const absoluteMin = HOVERED_SAFE_AREA
  // 絶対座標で中心座標を計算
  const center = anchorRect.left - rect.width / 2
  const limitedCenter = Math.max(Math.min(center, absoluteMax), absoluteMin)
  // left基準座標に座標変換 (再計算時に0以外になるとちらつくので `transform(50%)` を考慮した座標系にする)
  return limitedCenter - anchorRect.left + rect.width / 2
}

const hoveredOffset = ref('0px')

const observer = new ResizeObserver(() => {
  // 再計算は表示時のみ
  if (!props.present) {
    return
  }
  hoveredOffset.value = px(measureHoveredOffset())
})

onMounted(() => {
  if (!hoveredRef.value) return
  observer.observe(hoveredRef.value)
})
onUnmounted(() => observer.disconnect())
</script>
<style lang="scss" scoped>
@import '~~/components/partials/token.scss';

.anchor {
  position: relative;
}

.popover {
  @include round-corner;
  @include background-blur;
  position: absolute;
  top: 50%;
  background-color: $surface2;
  color: $text4;
  font-size: $typography-s;
  width: max-content;
  top: auto;
  bottom: 50%;
  left: v-bind(hoveredOffset);
  transform: translate(-50%, calc(-1 * v-bind(offset)));
  z-index: 1;
}
</style>
