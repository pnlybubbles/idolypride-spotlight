<template>
  <div class="assistive-text">
    <slot></slot>
    <div v-if="show === 'required'" class="assistive error">この項目は必須です</div>
    <div v-else-if="show === 'validation'" class="assistive error"><slot name="error"></slot></div>
  </div>
</template>
<script setup lang="ts">
interface Props {
  show: 'required' | 'validation' | null
}
defineProps<Props>()
</script>
<style lang="scss" scoped>
@import '~~/components/partials/token.scss';

.assistive-text {
  display: grid;
  grid: auto-flow / auto;
  gap: 2px;
}

.assistive {
  padding: 0 8px;
  font-size: $typography-s;

  &.error {
    color: $error;
  }
}
</style>
