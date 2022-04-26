<template>
  <div class="tooltip" :class="[position]" @touchstart.stop @touchend.stop>
    <div v-if="skill" class="heading">
      <div class="name">{{ skill.name }}</div>
      <div class="detail">
        <SkillText :skill="skill" class="scrolling" with-ct></SkillText>
      </div>
    </div>
    <div v-else class="fail">スキル失敗</div>
    <template v-if="Object.keys(aggregatedActivated).length > 0">
      <div class="divider"></div>
      <div class="buff">
        <div v-for="(value, key) in aggregatedActivated" :key="key" class="item">
          {{ value }} {{ buffAbilityTypeLabel(key, internalLabel) }}
        </div>
      </div>
    </template>
  </div>
</template>
<script setup lang="ts">
import { useInternalLabel } from '~~/composable/localstorage-descriptors'
import { BuffAbilityType, SkillData } from '~~/utils/types'
import { buffAbilityTypeLabel } from '~~/utils/common'

interface Props {
  skill: SkillData | undefined
  activated: { type: BuffAbilityType; amount: number }[] | undefined
  position?: 'left' | 'right'
}
const props = withDefaults(defineProps<Props>(), { position: 'left' })

// 同じバフが2重でかかったりするので集計する
const aggregatedActivated = computed(() =>
  (props.activated ?? []).reduce(
    (acc, v) => ({ ...acc, [v.type]: (acc[v.type] ?? 0) + v.amount }),
    {} as { [key in BuffAbilityType]?: number }
  )
)

const [internalLabel] = useInternalLabel()
</script>
<style lang="scss" scoped>
@import '~~/components/partials/token.scss';

@mixin padder {
  padding: 0 8px;
}

.tooltip {
  @include round-corner;
  @include background-blur;
  position: absolute;
  z-index: 2;
  top: 50%;
  background-color: $surface2;
  color: $text4;
  padding: 6px 0;
  font-size: $typography-s;
  text-align: left;
  width: max-content;
  max-width: 120px;
  display: grid;
  gap: 4px;

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
}

.fail {
  @include padder;
}

.name {
  @include padder;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.detail {
  overflow-x: auto;
  padding-bottom: 8px;
  margin-bottom: -8px;

  .scrolling {
    @include padder;
    display: inline-flex;
  }
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

.buff {
  overflow-x: auto;
  padding-bottom: 8px;
  margin-bottom: -8px;
}

.item {
  @include padder;
  display: inline-flex;
  white-space: nowrap;
}
</style>
