<template>
  <Popover class="tooltip" :position="position">
    <div v-if="skill" class="heading">
      <div class="name">{{ skill.name }}</div>
      <div class="detail">
        <SkillText :skill="skill" class="scrolling" with-ct></SkillText>
      </div>
    </div>
    <div v-else class="fail">スキル失敗</div>
    <template v-if="showBuff">
      <div class="divider"></div>
      <div class="buff">
        <div class="scrolling">
          <LiveBuffText :affected="affected"></LiveBuffText>
        </div>
      </div>
    </template>
  </Popover>
</template>
<script setup lang="ts">
import { BuffAbilityType, SkillData } from '~~/utils/types'

interface Props {
  skill: SkillData | undefined
  affected: { type: BuffAbilityType; amount: number }[]
  position?: 'left' | 'right'
}
const props = withDefaults(defineProps<Props>(), { position: 'left' })
const showBuff = computed(() => props.affected.length > 0)
</script>
<style lang="scss" scoped>
@import '~~/components/partials/token.scss';

@mixin padder {
  padding: 0 8px;
}

.tooltip {
  z-index: 2;
  padding: 6px 0;
  max-width: 120px;
  display: grid;
  gap: 4px;
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
  white-space: nowrap;

  .scrolling {
    @include padder;
    display: inline-flex;
    flex-direction: column;
  }
}
</style>
