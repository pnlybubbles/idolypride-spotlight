<template>
  <font-awesome-icon v-if="unit === 'サニーピース'" icon="sun" />
  <font-awesome-icon v-else-if="unit === '月のテンペスト'" icon="moon" />
  <font-awesome-icon v-else-if="unit === 'TRINITYAiLE'" icon="feather-pointed" />
  <font-awesome-icon v-else-if="unit === 'LizNoir'" icon="mug-hot" />
  <font-awesome-icon v-else-if="unit === '星見プロダクション'" icon="star" />
  <font-awesome-icon v-else-if="unit === 'ⅢX'" icon="gun" />
  <font-awesome-icon v-else icon="music" />
</template>
<script setup lang="ts">
import { UnitName } from '~~/utils/common'

interface Props {
  unit: UnitName | undefined
}
defineProps<Props>()
</script>
