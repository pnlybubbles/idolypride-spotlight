<template>
  <div class="skill">
    <Popover v-model:present="present" position="center">
      <template #anchor>
        <Interactive
          class="hit"
          :class="{ big: variant === 'a' || variant === 'sp' }"
          @long-press="$emit('longPress'), (showGap = true)"
          @release="$emit('release'), (showGap = false)"
          @click="showTooltip = !showTooltip"
        >
          <div class="marker" :class="{ fail, highlighted: present, [variant]: true }"></div>
        </Interactive>
      </template>
      <div v-if="showGap" class="tooltip">
        <div v-if="gap !== null" class="gap">{{ SKILL_TYPE[variant] }}間隔: {{ gap }}</div>
        <div v-if="gap !== null && activated.length > 0" class="divider"></div>
        <div v-if="activated.length > 0" class="ability">
          <div v-for="item in activated" :key="item.abilityId">
            {{ item.amount }} {{ buffAbilityTypeLabel(item.type, internalLabel) }} (レーン:
            {{ laneLabel(item.target) }})
          </div>
        </div>
      </div>
      <LiveTooltip v-if="showTooltip && !showGap" :skill="skill" :affected="affected"></LiveTooltip>
    </Popover>
    <div v-if="variant !== 'p'" class="beat" :class="variant">{{ beat }}</div>
  </div>
</template>
<script setup lang="ts">
import { useFumenScaleFactor, useInternalLabel } from '~~/composable/localstorage-descriptors'
import { buffAbilityTypeLabel, SKILL_TYPE } from '~~/utils/common'
import { AbilityType, BuffAbilityType, Lane, SkillData } from '~~/utils/types'
import { cssBeat, cssBuff } from './helper'

interface Props {
  variant: 'a' | 'sp' | 'p'
  fail: boolean | null
  beat: number
  buff: AbilityType
  affected: { type: BuffAbilityType; amount: number }[]
  activated: { abilityId: string; type: BuffAbilityType; amount: number; target: Lane[] }[]
  skill: SkillData | undefined
  lane: Lane
  gap: number | null
}

const props = defineProps<Props>()

interface Emits {
  (e: 'longPress'): void
  (e: 'release'): void
}

defineEmits<Emits>()

const [scaleFactor] = useFumenScaleFactor()

const top = computed(() => cssBeat(props.beat, scaleFactor.value))
const color = computed(() => cssBuff(props.buff))

const showTooltip = ref(false)
const showGap = ref(false)

const present = computed({
  get: () => showTooltip.value || (showGap.value && (props.gap !== null || props.activated.length > 0)),
  set: () => ((showTooltip.value = false), (showGap.value = false)),
})

const [internalLabel] = useInternalLabel()

const laneLabel = (target: Lane[]) =>
  [...target]
    .sort()
    .map((v) => v + 1)
    .join(',')
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

  &.big {
    width: 80px;
    height: 40px;
  }
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

  &.highlighted {
    box-shadow: 0 0 8px v-bind(color);
  }
}

.beat {
  top: 50%;
  transform: translateY(-50%);
  position: absolute;
  font-size: $typography-m;
  color: $text3;
  pointer-events: none;

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

.tooltip {
  z-index: 2;
  padding: 6px 0;
  display: grid;
  gap: 4px;
}

@mixin padder {
  padding: 0 8px;
}

.gap {
  @include padder;
}

.divider {
  position: relative;

  &::before {
    content: '';
    display: block;
    position: absolute;
    left: 50%;
    transform: translateX(-50%);
    width: 95%;
    border-top: 1px solid $surface2-stroke;
  }
}

.ability {
  @include padder;
}
</style>
