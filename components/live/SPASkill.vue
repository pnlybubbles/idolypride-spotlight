<template>
  <Interactive
    class="skill"
    :class="{ fail, [variant]: true }"
    @long-press="$emit('long-press')"
    @click="showTooltip = !showTooltip"
  >
    <div class="beat">{{ beat }}</div>
    <LiveTooltip
      v-show="showTooltip"
      :activated="activated"
      :skill="skill"
      :position="lane === 0 ? 'right' : 'left'"
    ></LiveTooltip>
  </Interactive>
</template>
<script setup lang="ts">
import { AbilityType, BuffAbilityType, Lane, SkillData } from '~~/utils/types'
import { cssBeat, cssBuff } from './helper'

interface Props {
  variant: 'a' | 'sp'
  fail: boolean
  beat: number
  buff: AbilityType
  activated: { type: BuffAbilityType; amount: number }[]
  skill: SkillData | undefined
  lane: Lane
}

const props = defineProps<Props>()

interface Emits {
  (e: 'long-press'): void
}

defineEmits<Emits>()

const { fail, beat, buff } = toRefs(props)
const top = computed(() => cssBeat(beat.value))
const color = computed(() => cssBuff(buff.value))

const showTooltip = ref(false)
</script>
<style lang="scss" scoped>
@import './skill.scss';
@import '~~/components/partials/token.scss';

.skill {
  &.fail {
    border-color: red;
    background: repeating-linear-gradient(45deg, red, red 2px, transparent 2px, transparent 6px);
  }
}

.sp {
  @include skill(40px, v-bind(color), v-bind(top));
}

.a {
  @include skill(20px, v-bind(color), v-bind(top));
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
