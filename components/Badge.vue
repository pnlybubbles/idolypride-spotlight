<template>
  <span class="badge" :class="{ warning }"><slot></slot></span>
</template>
<script setup lang="ts">
interface Props {
  warning?: boolean
}
defineProps<Props>()
</script>
<style lang="scss" scoped>
@import '~~/components/partials/token.scss';

.badge {
  @include round-corner('S');
  font-size: $typography-xs;
  padding: 2px 8px;
  font-weight: normal;
}

.warning {
  background-color: rgba($warning, 0.1);
  color: $warning;
}
</style>
