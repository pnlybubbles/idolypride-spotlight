<template>
  <div class="skill-tag" :class="{ mini }">
    <div class="skill-type">{{ skill.type.toUpperCase() }}</div>
    <div v-if="skill.type !== 'sp'" class="skill-ct">{{ skill.ct === 0 ? '-' : skill.ct }}</div>
  </div>
</template>
<script setup lang="ts">
import { SkillData } from '~~/utils/types'

interface Props {
  skill: SkillData
  mini?: boolean
}
defineProps<Props>()
</script>
<style lang="scss" scoped>
@import '~~/components/partials/token.scss';

.skill-tag {
  @include round-corner;
  background-color: $surface1;
  padding: 4px 8px;
  display: grid;
  grid: auto / auto-flow;
  gap: 4px;

  .skill-type {
    font-size: $typography-s;
    font-weight: bold;
    color: $text1;
  }

  .skill-ct {
    font-size: $typography-s;
    font-weight: bold;
    color: $text3;
  }

  &.mini {
    padding: 3px 6px;

    .skill-type {
      font-size: $typography-xs;
    }

    .skill-ct {
      font-size: $typography-xs;
    }
  }
}
</style>
