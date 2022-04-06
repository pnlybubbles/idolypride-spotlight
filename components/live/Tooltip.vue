<template>
  <div class="tooltip" @touchstart.stop @touchend.stop>
    <div v-if="skill" class="heading">
      <div class="name">{{ skill.name }}</div>
      <SkillText :skill="skill" class="detail"></SkillText>
    </div>
    <div v-else>スキル失敗</div>
    <div v-if="activated && activated.length > 0" class="buff">
      <div v-for="(item, i) in activated" :key="i" class="item">{{ item.amount }} {{ item.type }}</div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { BuffAbilityType, SkillData } from '~~/utils/types'

interface Props {
  skill: SkillData | undefined
  activated?: { type: BuffAbilityType; amount: number }[]
}
defineProps<Props>()
</script>
<style lang="scss" scoped>
@import '~~/components/partials/token.scss';

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
}

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
</style>
