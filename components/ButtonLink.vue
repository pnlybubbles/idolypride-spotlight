<template>
  <NuxtLink :to="to" class="button-link" :aria-disabled="disabled" @touchend="null"><slot></slot></NuxtLink>
</template>
<script setup lang="ts">
interface Props {
  to: string
  disabled?: boolean
}
withDefaults(defineProps<Props>(), { disabled: false })
</script>
<style lang="scss" scoped>
@import '~~/components/partials/utils.scss';

.button-link {
  @include button-like;
}
</style>
