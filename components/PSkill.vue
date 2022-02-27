<template>
  <div class="p"></div>
</template>
<script setup lang="ts">
import { BuffType } from '~~/utils/types'
import { cssBeat, cssBuff } from './helper'

interface Props {
  beat: number
  buff: BuffType
}

const props = defineProps<Props>()
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
