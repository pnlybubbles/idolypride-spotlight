<template>
  <div class="skill">
    <Interactive class="hit" @long-press="$emit('long-press')" @click="showTooltip = !showTooltip">
      <div class="marker" :class="{ fail, [variant]: true }"></div>
    </Interactive>
    <div v-if="variant !== 'p'" class="beat" :class="variant">{{ beat }}</div>
    <LiveTooltip
      v-show="showTooltip"
      :activated="activated"
      :skill="skill"
      :position="lane === 0 ? 'right' : 'left'"
    ></LiveTooltip>
  </div>
</template>
<script setup lang="ts">
import { useFumenScaleFactor } from '~~/composable/localstorage-descriptors'
import { AbilityType, BuffAbilityType, Lane, SkillData } from '~~/utils/types'
import { cssBeat, cssBuff } from './helper'

interface Props {
  variant: 'a' | 'sp' | 'p'
  fail?: boolean
  beat: number
  buff: AbilityType
  activated?: { type: BuffAbilityType; amount: number }[]
  skill: SkillData | undefined
  lane: Lane
}

const props = defineProps<Props>()

interface Emits {
  (e: 'long-press'): void
}

defineEmits<Emits>()

const [scaleFactor] = useFumenScaleFactor()

const { fail, beat, buff } = toRefs(props)
const top = computed(() => cssBeat(beat.value, scaleFactor.value))
const color = computed(() => cssBuff(buff.value))

const showTooltip = ref(false)
</script>
<style lang="scss" scoped>
@import '~~/components/partials/token.scss';

.skill {
  position: absolute;
  top: calc(v-bind(top));
  left: 50%;
}

.hit {
  position: absolute;
  width: 24px;
  height: 24px;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

$sp-size: 40px;
$a-size: 20px;
$p-size: 8px;

.marker {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  border: 2px solid v-bind(color);
  border-radius: 100%;

  &.sp {
    width: $sp-size;
    height: $sp-size;
  }

  &.a {
    width: $a-size;
    height: $a-size;
  }

  &.p {
    width: $p-size;
    height: $p-size;
  }

  &.fail {
    border-color: red;
    background: repeating-linear-gradient(45deg, red, red 2px, transparent 2px, transparent 6px);
  }
}

.beat {
  top: 50%;
  transform: translateY(-50%);
  position: absolute;
  font-size: $typography-m;
  color: $text3;

  &.sp {
    right: calc(100% + 4px + $sp-size / 2);
  }

  &.a {
    right: calc(100% + 4px + $a-size / 2);
  }

  &.p {
    right: calc(100% + 4px + $p-size / 2);
  }
}
</style>
