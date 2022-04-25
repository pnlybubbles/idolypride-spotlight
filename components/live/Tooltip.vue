<template>
  <div class="tooltip" :class="[position]" @touchstart.stop @touchend.stop>
    <div v-if="skill" class="heading">
      <div class="name">{{ skill.name }}</div>
      <SkillText :skill="skill" class="detail" with-ct></SkillText>
    </div>
    <div v-else>スキル失敗</div>
    <div v-if="Object.keys(aggregatedActivated).length > 0" class="buff">
      <div v-for="(value, key) in aggregatedActivated" :key="key" class="item">{{ value }} {{ key }}</div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { BuffAbilityType, SkillData } from '~~/utils/types'

interface Props {
  skill: SkillData | undefined
  activated: { type: BuffAbilityType; amount: number }[] | undefined
  position?: 'left' | 'right'
}
const props = withDefaults(defineProps<Props>(), { position: 'left' })

// 同じバフが2重でかかったりするので集計する
const aggregatedActivated = computed(() =>
  props.activated
    ? props.activated.reduce(
        (acc, v) => ({ ...acc, [v.type]: (acc[v.type] ?? 0) + v.amount }),
        {} as { [key in BuffAbilityType]?: number }
      )
    : []
)
</script>
<style lang="scss" scoped>
@import '~~/components/partials/token.scss';

.tooltip {
  @include round-corner;
  @include background-blur;
  position: absolute;
  z-index: 2;
  top: 50%;
  background-color: $surface2;
  color: $text4;
  padding: 6px 8px;
  font-size: $typography-s;
  text-align: left;
  width: max-content;
  max-width: 120px;
  display: grid;
  gap: 7px;

  &.left {
    right: 50%;
    transform: translate(-4px, 4px);
  }

  &.right {
    left: 50%;
    transform: translate(4px, 4px);
  }
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
