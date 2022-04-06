<template>
  <Interactive class="p" @long-press="$emit('long-press')" @click="showTooltip = !showTooltip">
    <LiveTooltip v-show="showTooltip" :skill="skill"> </LiveTooltip>
  </Interactive>
</template>
<script setup lang="ts">
import { AbilityType, SkillData } from '~~/utils/types'
import { cssBeat, cssBuff } from './helper'

interface Props {
  beat: number
  buff: AbilityType
  skill: SkillData | undefined
}

const props = defineProps<Props>()

interface Emits {
  (e: 'long-press'): void
}

defineEmits<Emits>()

const { beat, buff } = toRefs(props)
const top = computed(() => cssBeat(beat.value))
const color = computed(() => cssBuff(buff.value))

const showTooltip = ref(false)
</script>
<style lang="scss" scoped>
@import './skill.scss';

.p {
  @include skill(8px, v-bind(color), v-bind(top));
}
</style>
