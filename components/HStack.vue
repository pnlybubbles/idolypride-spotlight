<template>
  <div class="h-stack" :style="{ gap: px(spacing) }">
    <slot></slot>
  </div>
</template>
<script setup lang="ts">
import { px } from '~~/utils/common'

interface Props {
  spacing: number
}
defineProps<Props>()
</script>
<style lang="scss" scoped>
.h-stack {
  display: grid;
  grid: auto / auto-flow 1fr;
}
</style>
