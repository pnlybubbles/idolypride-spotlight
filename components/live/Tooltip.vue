<template>
  <div class="tooltip">
    <div v-if="skill" class="heading">
      <div class="title">
        <SkillTag :skill="skill" mini invert></SkillTag>
        <div class="name">{{ skill.name }}</div>
        <div class="level">Lv.{{ skill.level }}</div>
      </div>
      <div class="detail">
        <SkillText :skill="skill" class="scrolling" delimiter="newline" :with-lv="false"></SkillText>
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
  </div>
</template>
<script setup lang="ts">
import { BuffAbilityType, SkillData } from '~~/utils/types'

interface Props {
  skill: SkillData | undefined
  affected: { type: BuffAbilityType; amount: number }[]
}
const props = defineProps<Props>()

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
  display: grid;
  gap: 4px;
}

.heading {
  display: grid;
  grid: auto auto / auto;
  gap: 4px;
}

.fail {
  @include padder;
}

.title {
  @include padder;
  display: grid;
  grid: auto / auto-flow;
  gap: 8px;
  align-items: center;
  justify-content: start;

  .name {
    font-size: $typography-s;
  }
}

.detail {
  overflow-x: auto;
  padding-bottom: 8px;
  margin-bottom: -8px;

  .scrolling {
    @include padder;
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
