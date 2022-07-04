<template>
  <div class="skill-text" :class="{ [delimiter]: true }">
    <div v-if="withCt && skill.type !== 'sp'" class="ability">CT{{ skill.ct }}</div>
    <div v-if="skill.type === 'p'" class="ability">
      <font-awesome-icon icon="flag"></font-awesome-icon>
      <div>{{ skillTriggerTypeLabel(skill.trigger, internalLabel) }}</div>
    </div>
    <div v-for="ability in sortAbility(skill.ability)" :key="ability.id" class="ability">
      <template v-if="ability.div === 'score'">
        <RoleIcon role="scorer"></RoleIcon>
        <div>{{ ability.amount }}%</div>
        <div v-if="ability.enhance.type !== 'none'">{{ abilityEnhanceLabel(ability.enhance, internalLabel) }}</div>
        <div v-if="ability.condition.type !== 'none'">
          ({{ abilityConditionTypeLabel(ability.condition, internalLabel) }})
        </div>
      </template>
      <template v-if="ability.div === 'buff' || ability.div === 'action-buff'">
        <RoleIcon role="buffer"></RoleIcon>
        <div v-if="!deriveDisabledAmount(ability.type)">{{ ability.amount }}</div>
        <div v-if="ability.div === 'buff'">{{ buffAbilityTypeLabel(ability.type, internalLabel) }}</div>
        <div v-else-if="ability.div === 'action-buff'">{{ actionAbilityTypeLabel(ability.type, internalLabel) }}</div>
        <div>{{ abilityTargetLabel(ability.target, internalLabel) }}</div>
        <div v-if="ability.condition.type !== 'none'">
          ({{ abilityConditionTypeLabel(ability.condition, internalLabel) }})
        </div>
        <div v-if="ability.div === 'buff'">[{{ ability.span }}]</div>
      </template>
    </div>
    <div v-if="withLv" class="ability">
      <div>lv.{{ skill.level }}</div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { useInternalLabel } from '~~/composable/localstorage-descriptors'
import { AbilityData, AbilityDiv, PassiveAbilityData, SkillData } from '~~/utils/types'
import { deriveDisabledAmount } from './idol-form/helper'
import {
  abilityEnhanceLabel,
  abilityConditionTypeLabel,
  buffAbilityTypeLabel,
  actionAbilityTypeLabel,
  abilityTargetLabel,
  skillTriggerTypeLabel,
} from '~~/utils/common'

interface Props {
  skill: SkillData
  withCt?: boolean
  withLv?: boolean
  delimiter?: 'dot' | 'newline'
}
withDefaults(defineProps<Props>(), { delimiter: 'dot', withLv: true })

const ABILITY_ORDERING: { [key in AbilityDiv]: number } = {
  score: 0,
  buff: 1,
  'action-buff': 2,
}

const sortAbility = (ability: AbilityData[] | PassiveAbilityData[]) =>
  [...ability].sort((a, b) => ABILITY_ORDERING[a.div] - ABILITY_ORDERING[b.div])

const [internalLabel] = useInternalLabel()
</script>
<style lang="scss" scoped>
@import '~~/components/partials/token.scss';

.skill-text {
  display: grid;

  &.dot {
    grid: auto / auto-flow;
    justify-content: start;
    gap: 16px;
  }

  &.newline {
    grid: auto-flow / auto;
    justify-items: start;
    gap: 4px;
  }
}

.ability {
  font-size: $typography-s;
  align-items: center;

  & svg {
    font-size: 10px;

    &:first-child {
      margin-left: 2px;
    }
  }
}

.dot .ability {
  display: grid;
  grid: auto / auto-flow;
  gap: 4px;
  position: relative;
  white-space: nowrap;

  & + .ability {
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
}

.newline .ability {
  display: block;

  & > * + * {
    margin-left: 4px;
    display: inline;
  }
}
</style>
