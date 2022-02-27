<template>
  <button :disabled="disabled ?? false" class="button" :class="[variant]"><slot></slot></button>
</template>
<script setup lang="ts">
interface Props {
  variant?: 'primary' | 'secondary'
  disabled?: boolean
}
interface Emits {
  (e: 'click'): void
}
defineProps<Props>()
defineEmits<Emits>()
</script>
<style lang="scss" scoped>
@import './token.scss';
@import './partials/utils.scss';

.button {
  @include reset-button;

  /* Custom styles */
  font-size: 14px;
  font-weight: bold;
  padding: 8px 16px;
  background-color: $primary;
  color: $text1;

  @include round-corner;

  &:disabled {
    opacity: 0.32;
  }
}
</style>
