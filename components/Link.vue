<template>
  <NuxtLink :to="to" class="link"><slot></slot></NuxtLink>
</template>
<script setup lang="ts">
interface Props {
  to: string
}
defineProps<Props>()
</script>
<style lang="scss" scoped>
@import './partials/utils.scss';

.link {
  @include button-like;
}
</style>
