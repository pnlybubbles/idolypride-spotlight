<template>
  <div class="skill-text">
    <div v-if="withCt && skill.type !== 'sp'" class="ability">CT{{ skill.ct }}</div>
    <div v-for="ability in sortAbility(skill.ability)" :key="ability.id" class="ability">
      <template v-if="ability.div === 'score'">
        <RoleIcon role="scorer"></RoleIcon>
        <div>{{ ability.amount }}%</div>
        <div v-if="ability.condition.type !== 'none'">
          ({{ ability.condition.type }}{{ 'amount' in ability.condition ? ` ${ability.condition.amount}` : '' }})
        </div>
      </template>
      <template v-if="ability.div === 'buff'">
        <RoleIcon role="buffer"></RoleIcon>
        <div>{{ ability.amount }}</div>
        <div>{{ ability.type }}</div>
        <div>{{ ability.target }}</div>
        <div v-if="ability.condition.type !== 'none'">
          ({{ ability.condition.type }}{{ 'amount' in ability.condition ? ` ${ability.condition.amount}` : '' }})
        </div>
        <div>[{{ ability.span }}]</div>
      </template>
      <template v-if="ability.div === 'action-buff'">
        <RoleIcon role="buffer"></RoleIcon>
        <div>{{ ability.amount }}</div>
        <div>{{ ability.type }}</div>
        <div>{{ ability.target }}</div>
        <div v-if="ability.condition.type !== 'none'">
          ({{ ability.condition.type }}{{ 'amount' in ability.condition ? ` ${ability.condition.amount}` : '' }})
        </div>
      </template>
    </div>
    <div class="ability">
      <div>lv.{{ skill.level }}</div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { AbilityData, AbilityDiv, PassiveAbilityData, SkillData } from '~~/utils/types'

interface Props {
  skill: SkillData
  withCt?: boolean
}
defineProps<Props>()

const ABILITY_ORDERING: { [key in AbilityDiv]: number } = {
  score: 0,
  buff: 1,
  'action-buff': 2,
}

const sortAbility = (ability: AbilityData[] | PassiveAbilityData[]) =>
  [...ability].sort((a, b) => ABILITY_ORDERING[a.div] - ABILITY_ORDERING[b.div])
</script>
<style lang="scss" scoped>
@import '~~/components/partials/token.scss';

.skill-text {
  display: grid;
  grid: auto / auto-flow;
  justify-content: start;
  gap: 16px;
}

.ability {
  display: grid;
  grid: auto / auto-flow;
  gap: 4px;
  font-size: $typography-s;
  align-items: center;
  position: relative;
  white-space: nowrap;

  & + & {
    &::before {
      content: '';
      display: block;
      position: absolute;
      left: -8px;
      top: 50%;
      width: 2px;
      height: 2px;
      border-radius: 50%;
      transform: translate(-50%, -50%);
      background-color: currentColor;
    }
  }

  & svg {
    font-size: 10px;
  }
}
</style>
