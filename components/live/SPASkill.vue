<template>
  <Interactive
    class="skill"
    :class="{ fail, [variant]: true }"
    @long-press="$emit('long-press')"
    @click="showTooltip = !showTooltip"
  >
    <div class="beat">{{ beat }}</div>
    <div v-show="showTooltip" class="tooltip">
      <div v-if="skill" class="heading">
        <div class="name">{{ skill.name }}</div>
        <SkillText :skill="skill" class="detail"></SkillText>
      </div>
      <div v-else>スキル失敗</div>
      <div v-if="activated.length > 0" class="buff">
        <div v-for="(item, i) in activated" :key="i" class="item">{{ item.amount }} {{ item.type }}</div>
      </div>
    </div>
  </Interactive>
</template>
<script setup lang="ts">
import { AbilityType, BuffAbilityType, SkillData } from '~~/utils/types'
import { cssBeat, cssBuff } from './helper'

interface Props {
  variant: 'a' | 'sp'
  fail: boolean
  beat: number
  buff: AbilityType
  activated: { type: BuffAbilityType; amount: number }[]
  skill: SkillData | undefined
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

.tooltip {
  @include round-corner;
  @include background-blur;
  position: absolute;
  z-index: 2;
  right: 50%;
  top: 50%;
  transform: translate(-4px, 4px);
  background-color: $surface2;
  color: $text4;
  padding: 6px 8px;
  font-size: $typography-s;
  text-align: left;
  width: max-content;
  max-width: 120px;
  display: grid;
  gap: 7px;

  .heading {
    overflow: hidden;
    margin-bottom: -8px;
  }

  .name {
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
  }

  .detail {
    overflow-x: auto;
    padding-bottom: 8px;
  }

  .buff {
    position: relative;

    &::before {
      content: '';
      display: block;
      position: absolute;
      left: 50%;
      top: -4px;
      transform: translateX(-50%);
      width: 110%;
      border-top: 1px solid $surface2-stroke;
    }
  }

  .item {
    white-space: nowrap;
  }
}
</style>
