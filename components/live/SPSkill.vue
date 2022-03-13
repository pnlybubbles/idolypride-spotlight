<template>
  <div class="sp" :class="{ fail }" @click="$emit('click')" @touchend="null">
    <div class="beat">{{ beat }}</div>
  </div>
</template>
<script setup lang="ts">
import { AbilityType } from '~~/utils/types'
import { cssBeat, cssBuff } from './helper'

interface Props {
  fail: boolean
  beat: number
  buff: AbilityType
}

const props = defineProps<Props>()

interface Emits {
  (e: 'click'): void
}

defineEmits<Emits>()

const { fail, beat, buff } = toRefs(props)
const top = computed(() => cssBeat(beat.value))
const color = computed(() => cssBuff(buff.value))
</script>
<style lang="scss" scoped>
@import './skill.scss';
@import '~~/components/partials/token.scss';

.sp {
  @include skill(40px, v-bind(color), v-bind(top));
  @include failable;
}

.beat {
  top: 50%;
  right: calc(100% + 6px);
  transform: translateY(-50%);
  position: absolute;
  font-size: $typography-m;
  color: $text3;
}
</style>
