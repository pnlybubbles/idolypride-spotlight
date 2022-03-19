<template>
  <div class="section" :style="overflow ? { padding: '0' } : gutterStyle">
    <div v-if="$slots.label" class="label" :style="!overflow ? { padding: '0' } : gutterStyle">
      <slot name="label"></slot>
    </div>
    <div v-if="overflow" class="overflow">
      <div class="scrolling" :style="gutterStyle"><slot></slot></div>
    </div>
    <div v-else class="stack"><slot></slot></div>
  </div>
</template>
<script setup lang="ts">
interface Props {
  gutter?: number
  overflow?: boolean
}
const props = defineProps<Props>()

const gutterStyle = computed(() => (props.gutter !== undefined ? { padding: `0 ${props.gutter}px` } : {}))
</script>
<style lang="scss" scoped>
@import '~~/components/partials/token.scss';

.section {
  @include align;

  display: grid;
  grid: auto-flow / auto;
  gap: 4px;
}

.label {
  @include align;

  font-size: $typography-s;
  color: $text1;
}

.stack {
  display: grid;
  grid: auto-flow / auto;
  gap: 8px;
}

.overflow {
  display: inline-flex;
  overflow-x: auto;
  padding-bottom: 10px;
  margin-bottom: -10px;
}

.scrolling {
  @include align;
}
</style>
