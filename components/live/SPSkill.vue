<template>
  <div class="sp" :class="{ fail }"></div>
</template>
<script setup lang="ts">
import { BuffType } from '~~/utils/types'
import { cssBeat, cssBuff } from './helper'

interface Props {
  fail: boolean
  beat: number
  buff: BuffType
}

const props = defineProps<Props>()
const { fail, beat, buff } = toRefs(props)
const top = computed(() => cssBeat(beat.value))
const color = computed(() => cssBuff(buff.value))
</script>
<style lang="scss" scoped>
@import './skill.scss';

.sp {
  @include skill(40px, v-bind(color), v-bind(top));
  @include failable;
}
</style>
