<template>
  <div class="skill-text">
    <div v-if="withCt && skill.type !== 'sp'" class="ability">CT{{ skill.ct }}</div>
    <div v-for="ability in sortAbility(skill.ability)" :key="ability.id" class="ability">
      <template v-if="ability.div === 'score'">
        <RoleIcon role="scorer"></RoleIcon>
        <div>{{ ability.amount }}%</div>
        <div v-if="ability.enhance.type !== 'none'">
          {{ enhanceTypeLabel(ability.enhance.type)
          }}{{ 'value' in ability.enhance ? ` ${ability.enhance.value}` : '' }}
        </div>
        <div v-if="ability.condition.type !== 'none'">({{ abilityConditionTypeLabel(ability.condition) }})</div>
      </template>
      <template v-if="ability.div === 'buff' || ability.div === 'action-buff'">
        <RoleIcon role="buffer"></RoleIcon>
        <div v-if="!deriveDisabledAmount(ability.type)">{{ ability.amount }}</div>
        <div v-if="ability.div === 'buff'">{{ buffAbilityTypeLabel(ability.type) }}</div>
        <div v-else-if="ability.div === 'action-buff'">{{ actionAbilityTypeLabel(ability.type) }}</div>
        <div>{{ abilityTargetLabel(ability.target) }}</div>
        <div v-if="ability.condition.type !== 'none'">({{ abilityConditionTypeLabel(ability.condition) }})</div>
        <div v-if="ability.div === 'buff'">[{{ ability.span }}]</div>
      </template>
    </div>
    <div class="ability">
      <div>lv.{{ skill.level }}</div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { useInternalLabel } from '~~/composable/localstorage-descriptors'
import {
  ABILITY_CONDITION_WITHOUT_VALUE,
  ABILITY_CONDITION_WITH_VALUE,
  ABILITY_ENHANCE,
  ACTION_ABILITY_TYPE,
  BUFF_ABILITY_TYPE,
  BUFF_TARGET_WITHOUT_SUFFIX,
  BUFF_TARGET_WITH_SUFFIX,
  isBuffTargetWithoutSuffix,
} from '~~/utils/formatter'
import {
  AbilityCondition,
  AbilityData,
  AbilityDiv,
  AbilityEnhanceType,
  ActionAbilityType,
  BuffAbilityType,
  PassiveAbilityData,
  PassiveBuffTarget,
  SkillData,
} from '~~/utils/types'
import { extractBuffTarget, deriveDisabledAmount } from './idol-form/helper'

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

const [internalLabel] = useInternalLabel()

const enhanceTypeLabel = (type: AbilityEnhanceType) => (internalLabel.value ? type : ABILITY_ENHANCE[type])
const buffAbilityTypeLabel = (type: BuffAbilityType) => (internalLabel.value ? type : BUFF_ABILITY_TYPE[type])
const actionAbilityTypeLabel = (type: ActionAbilityType) => (internalLabel.value ? type : ACTION_ABILITY_TYPE[type])
// TODO: 専用のマッピングが合ったほうが良い気がする
const abilityTargetLabel = (t: PassiveBuffTarget) => {
  if (internalLabel.value) {
    return t
  }
  const { target, targetSuffix } = extractBuffTarget(t)
  if (isBuffTargetWithoutSuffix(target)) {
    if (target === 'triggered') {
      return '発動対象'
    }
    return BUFF_TARGET_WITHOUT_SUFFIX[target]
  } else {
    return BUFF_TARGET_WITH_SUFFIX[target].replace(/X/, targetSuffix)
  }
}
const abilityConditionTypeLabel = (condition: AbilityCondition) =>
  internalLabel.value
    ? `${condition.type}${'amount' in condition ? ` ${condition.amount}` : ''}`
    : 'amount' in condition
    ? ABILITY_CONDITION_WITH_VALUE[condition.type].replace(/X/, condition.amount.toString())
    : ABILITY_CONDITION_WITHOUT_VALUE[condition.type]
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
