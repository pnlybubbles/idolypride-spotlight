<template>
  <font-awesome-icon v-if="unit === 'サニーピース'" icon="sun" />
  <fone-awesome-icon v-else-if="unit === '月のテンペスト'" icon="moon" />
  <fone-awesome-icon v-else-if="unit === 'TRINITYAiLE'" icon="feather-pointed" />
  <fone-awesome-icon v-else-if="unit === 'LizNoir'" icon="mug-hot" />
  <fone-awesome-icon v-else icon="music" />
</template>
<script setup lang="ts">
interface Props {
  unit: string
}
defineProps<Props>()
</script>
