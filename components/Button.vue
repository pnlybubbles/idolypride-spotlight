<template>
  <button :disabled="disabled ?? false" class="button" :class="[variant]" @click="$emit('click')" @touchend="null">
    <slot></slot>
  </button>
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
@import '~~/components/partials/token.scss';
@import '~~/components/partials/utils.scss';

.button {
  @include reset-button;
  @include button-like;
}
</style>
