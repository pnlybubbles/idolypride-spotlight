<template>
  <div v-for="(value, key) in aggregatedActivated" :key="key" class="item">
    {{ value && value > 20 ? `20 (${value})` : value }} {{ buffAbilityTypeLabel(key, internalLabel) }}
  </div>
</template>
<script setup lang="ts">
import { useInternalLabel } from '~~/composable/localstorage-descriptors'
import { BuffAbilityType } from '~~/utils/types'
import { buffAbilityTypeLabel } from '~~/utils/common'

interface Props {
  affected: { type: BuffAbilityType; amount: number }[]
}
const props = defineProps<Props>()

// 同じバフが2重でかかったりするので集計する
const aggregatedActivated = computed(() =>
  props.affected.reduce(
    (acc, v) => ({ ...acc, [v.type]: (acc[v.type] ?? 0) + v.amount }),
    {} as { [key in BuffAbilityType]?: number }
  )
)

const [internalLabel] = useInternalLabel()
</script>
