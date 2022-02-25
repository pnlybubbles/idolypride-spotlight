<template>
  <div class="v-stack" :style="{ gap: px(spacing) }">
    <slot></slot>
  </div>
</template>
<script setup lang="ts">
import { px } from './helper'
interface Props {
  spacing: number
}
defineProps<Props>()
</script>
<style lang="scss" scoped>
.v-stack {
  display: grid;
  grid: auto-flow / auto;
}
</style>
