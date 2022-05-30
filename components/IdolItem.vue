<template>
  <div class="idol-item">
    <button class="heading" @click="$emit('click')" @touchend="null">
      <div class="type" :class="idol.type">
        <RoleIcon :role="idol.role" class="role"></RoleIcon>
      </div>
      <div>
        <span class="title">{{ idol.title }}</span>
        <span class="name">{{ idol.name }}</span>
      </div>
    </button>
    <div v-if="variant !== 'oneline'" class="status">
      <div class="skill-overview">
        <div v-for="skill in idol.skills" :key="skill.id" class="skill-tag">
          <div class="skill-type">{{ skill.type.toUpperCase() }}</div>
          <div v-if="skill.type !== 'sp'" class="skill-ct">{{ skill.ct === 0 ? '-' : skill.ct }}</div>
        </div>
      </div>
      <div v-if="variant === 'default'" class="skill-list">
        <SkillText v-for="skill in idol.skills" :key="skill.id" :skill="skill" class="skill-item"></SkillText>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { IdolData } from '~~/utils/types'

interface Props {
  idol: IdolData
  variant?: 'default' | 'mini' | 'oneline'
}
withDefaults(defineProps<Props>(), { variant: 'default' })

interface Emits {
  (e: 'click'): void
}
defineEmits<Emits>()
</script>
<style lang="scss" scoped>
@import '~~/components/partials/token.scss';
@import '~~/components/partials/utils.scss';

.idol-item {
  display: grid;
  grid: auto auto / auto;
  gap: 8px;
}

.heading {
  @include reset-button;
  @include clickable;
  @include align;
  display: grid;
  grid: auto / auto-flow;
  justify-content: start;
  align-items: center;
  gap: 8px;
}

.title {
  font-size: $typography-l;
  font-weight: bold;
  color: $text1;
  margin-right: 8px;
}

.name {
  font-size: $typography-s;
  color: $text3;
}

.role {
  font-size: 12px;
  color: $text1;
}

.type {
  @include round-corner;
  height: 20px;
  width: 20px;
  display: grid;
  align-items: center;
  justify-items: center;

  &.vocal {
    background-color: $vocal;
    @include bloom($vocal);
  }

  &.dance {
    background-color: $dance;
    @include bloom($dance);
  }

  &.visual {
    background-color: $visual;
    @include bloom($visual);
  }
}

.status {
  display: grid;
  grid: auto auto / auto;
  gap: 10px;
}

.skill-overview {
  @include align;
  display: grid;
  grid: auto / auto-flow;
  gap: 8px;
  justify-content: start;
}

.skill-tag {
  @include round-corner;
  background-color: $surface1;
  padding: 4px 8px;
  display: grid;
  grid: auto / auto-flow;
  gap: 4px;
}

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

.skill-list {
  display: grid;
  grid: auto-flow / auto;
  gap: 8px;
  overflow-x: auto;
  width: 100%;
  padding-bottom: 10px;
  margin-bottom: -10px;
}

.skill-item {
  @include align;
  color: $text3;
}
</style>
