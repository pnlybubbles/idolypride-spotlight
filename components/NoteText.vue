<template>
  <div class="note-text">
    <font-awesome-icon v-if="variant === 'info'" icon="circle-info"></font-awesome-icon>
    <slot></slot>
  </div>
</template>
<script setup lang="ts">
interface Props {
  variant?: 'info' | 'default'
}
withDefaults(defineProps<Props>(), { variant: 'default' })
</script>
<style lang="scss" scoped>
@import '~~/components/partials/token.scss';

.note-text {
  font-size: $typography-s;
  color: $text3;

  & > svg {
    margin-right: 4px;
  }
}
</style>
