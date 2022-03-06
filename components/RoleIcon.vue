<template>
  <font-awesome-icon v-if="role === 'scorer'" icon="diamond"></font-awesome-icon>
  <font-awesome-icon v-else-if="role === 'buffer'" icon="forward" class="buffer"></font-awesome-icon>
  <font-awesome-icon v-else-if="role === 'supporter'" icon="heart"></font-awesome-icon>
</template>
<script setup lang="ts">
import { IdolRole } from '~~/utils/types'

interface Props {
  role: IdolRole
}
defineProps<Props>()
</script>
<style lang="scss" scoped>
.buffer {
  transform: rotate(-90deg);
}
</style>
