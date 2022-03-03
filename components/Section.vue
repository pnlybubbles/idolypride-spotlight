<template>
  <div class="section" :style="gutter ? { padding: `0 ${gutter}px` } : {}">
    <div v-if="$slots.label" class="label">
      <slot name="label"></slot>
    </div>
    <slot></slot>
  </div>
</template>
<script setup lang="ts">
interface Props {
  gutter?: number
}
defineProps<Props>()
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
  font-size: $typography-s;
  color: $text1;
}
</style>
