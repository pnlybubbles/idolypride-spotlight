<template>
  <div class="p" @click="$emit('click')" @touchend="null"></div>
</template>
<script setup lang="ts">
import { AbilityType } from '~~/utils/types'
import { cssBeat, cssBuff } from './helper'

interface Props {
  beat: number
  buff: AbilityType
}

const props = defineProps<Props>()

interface Emits {
  (e: 'click'): void
}

defineEmits<Emits>()

const { beat, buff } = toRefs(props)
const top = computed(() => cssBeat(beat.value))
const color = computed(() => cssBuff(buff.value))
</script>
<style lang="scss" scoped>
@import './skill.scss';

.p {
  @include skill(8px, v-bind(color), v-bind(top));
}
</style>
