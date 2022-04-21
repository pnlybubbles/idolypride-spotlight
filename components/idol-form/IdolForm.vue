<template>
  <VStack :spacing="16">
    <Section>
      <template #label>名前</template>
      <Listbox v-model="idol.name" :options="nameOptions" required></Listbox>
    </Section>
    <Section>
      <template #label>カード名</template>
      <TextField v-model="idol.title" placeholder="夢の共演" required></TextField>
    </Section>
    <Section>
      <template #label>属性</template>
      <HStack :spacing="8">
        <Listbox v-model="idol.type" :options="typeOptions" required></Listbox>
        <Listbox v-model="idol.role" :options="roleOptions" required></Listbox>
      </HStack>
    </Section>
    <div v-for="skill in idol.skills" :key="skill.index">
      <div class="sub-heading">
        <div>スキル{{ skill.index + 1 }}</div>
        <div></div>
        <div class="level-label">Level</div>
        <div class="level-toggle">
          <button
            v-for="level in SKILL_LEVEL_MAX[skill.index]"
            :key="level"
            class="level-toggle-item"
            :class="{ active: level === skill.level }"
            @click="skill.level = level"
            @touchend="null"
          >
            {{ level }}
          </button>
        </div>
      </div>
      <VStack :spacing="16">
        <Section>
          <template #label>スキル名</template>
          <TextField v-model="skill.name" :placeholder="SKILLS_NAME_PLACEHOLDER[skill.index]" required></TextField>
        </Section>
        <Section>
          <template #label>スキルタイプ</template>
          <Listbox
            v-model="skill.type"
            :options="skill.index === 0 ? skillTypeOptions1 : skillTypeOptions23"
            required
          ></Listbox>
        </Section>
        <Section v-if="skill.type !== 'sp'">
          <template #label>CT</template>
          <HStack :spacing="8">
            <TextField
              :model-value="skill.once ? 'なし' : skill.ct"
              :placeholder="SKILLS_CT_PLACEHOLDER[skill.index]"
              :disabled="skill.once"
              type="number"
              required
              :preset="[30, 40, 50, 60, 70]"
              @update:model-value="skill.ct = $event"
            ></TextField>
            <Check v-model="skill.once">ライブ中1回</Check>
          </HStack>
        </Section>
        <Section>
          <template #label>効果</template>
          <div v-for="(ability, j) in skill.ability" :key="j" class="ability">
            <button class="remove-ability" @click="handleRemoveAbility(skill, j)" @touchend="null">
              <font-awesome-icon icon="circle-minus"></font-awesome-icon>
            </button>
            <Section :gutter="8">
              <template #label>種別</template>
              <Listbox v-model="ability.div" :options="abilityTypeOptions"></Listbox>
            </Section>
            <Section :gutter="8">
              <template #label>発動条件</template>
              <div class="left-main">
                <Listbox
                  v-model="ability.condition"
                  :options="skill.type === 'p' ? conditionOptionsForP : conditionOptions"
                  required
                ></Listbox>
                <TextField
                  v-if="isAbilityConditionWithValue(ability.condition)"
                  v-model="ability.conditionValue"
                  placeholder="X"
                  type="number"
                  required
                ></TextField>
              </div>
            </Section>
            <Section v-if="ability.div === 'buff' || ability.div === 'action-buff'" :gutter="8">
              <template #label>詳細</template>
              <div class="left-main">
                <Listbox
                  v-model="ability.target"
                  placeholder="対象"
                  :options="
                    availableTrigger(ability.condition) ? buffTargetOptionsIncludingTriggered : buffTargetOptions
                  "
                  required
                ></Listbox>
                <Listbox
                  v-if="ability.target && isBuffTargetSuffixRequired(ability.target)"
                  v-model="ability.targetSuffix"
                  placeholder="人数"
                  :options="buffTargetSuffixOptions"
                  required
                ></Listbox>
              </div>
              <Listbox
                v-model="ability.type"
                placeholder="バフの種類"
                :options="ability.div === 'buff' ? buffTypeOptions : actionBuffTypeOptions"
                required
              ></Listbox>
              <HStack :spacing="8">
                <TextField
                  v-model="ability.amount"
                  :placeholder="deriveUnitByBuffType(ability.type)"
                  :disabled="lift(deriveDisabledAmount)(ability.type) ?? false"
                  type="number"
                  required
                ></TextField>
                <TextField
                  v-if="ability.div === 'buff'"
                  v-model="ability.span"
                  :disabled="lift(disableSpan)(ability.type) ?? false"
                  placeholder="持続ビート数"
                  type="number"
                  required
                ></TextField>
              </HStack>
            </Section>
            <Section v-else-if="ability.div === 'score'" :gutter="8">
              <template #label>スコア</template>
              <TextField v-model="ability.amount" placeholder="1000" type="number" required></TextField>
            </Section>
          </div>
          <button class="new-ability" @click="handleAddAbility(skill)" @touchend="null">
            <font-awesome-icon icon="circle-plus"></font-awesome-icon>
            <div>効果を追加する</div>
          </button>
        </Section>
      </VStack>
    </div>
    <Section>
      <Button :disabled="disabled" @click="handleSubmit">{{ submitLabel }}</Button>
    </Section>
  </VStack>
</template>
<script setup lang="ts">
import {
  AbilityDiv,
  ActionAbilityType,
  AbilityConditionType,
  IdolRole,
  IdolType,
  SkillType,
  BuffAbilityType,
  BuffTargetCount,
  BuffTargetWithoutSuffix,
  IdolData,
} from '~~/utils/types'
import {
  ABILITY_CONDITION_WITHOUT_VALUE,
  ABILITY_CONDITION_WITH_VALUE,
  ACTION_ABILITY_TYPE,
  BUFF_ABILITY_TYPE,
  BUFF_TARGET_WITHOUT_SUFFIX,
  isAbilityConditionWithValue,
} from '~~/utils/formatter'
import {
  defaultIdolInput,
  formatIdol,
  IdolInput,
  isBuffTargetSuffixRequired,
  deriveDisabledAmount,
  defaultAbilityInput,
  deformatIdol,
  SkillInput,
  disableSpan,
} from './helper'
import { defined, lift } from '~~/utils'
import { IDOL_NAME } from '~~/utils/common'

interface Props {
  idol?: IdolData
  disabled: boolean
  submitLabel: string
}
const props = defineProps<Props>()
interface Emits {
  (e: 'submit', value: IdolData): void
}
const emit = defineEmits<Emits>()

const idol = reactive<IdolInput>(props.idol ? deformatIdol(props.idol) : defaultIdolInput())

const handleAddAbility = (skill: SkillInput) => {
  const currentSkill = defined(idol.skills.find((v) => v.index === skill.index))
  const currentAbility = currentSkill.ability.slice(-1)[0]
  currentSkill.ability.push(
    defaultAbilityInput({
      div: currentSkill.type !== 'p' && currentSkill.ability.length === 0 ? 'score' : 'buff',
      condition: currentSkill.type === 'p' ? currentAbility?.condition : undefined,
      conditionValue: currentSkill.type === 'p' ? currentAbility?.conditionValue : undefined,
    })
  )
}

const handleRemoveAbility = (skill: SkillInput, abilityIndex: number) => {
  if (!confirm(`効果を削除します。よろしいですか？`)) {
    return
  }
  idol.skills.find((v) => v.index === skill.index)?.ability.splice(abilityIndex, 1)
}

const handleSubmit = () => {
  emit('submit', formatIdol(idol))
}

type Option<T> = { id: T; label: string }[]
const objToOption = <K extends string>(obj: Record<K, string>): Option<K> =>
  Object.entries(obj).map(([id, label]) => ({ id, label })) as Option<K>
const arrayToOption = (array: string[]): Option<string> => array.map((id) => ({ id, label: id }))

type ExcludeUnknown<T> = Exclude<T, 'unknown'>
const omitOption =
  <S>(id: S) =>
  <T>(opt: Option<T | S>) =>
    opt.filter((v) => v.id !== id) as Option<T>
const omitUnknownOption = omitOption('unknown' as const)

const nameOptions: Option<string> = arrayToOption(IDOL_NAME)
const typeOptions: Option<IdolType> = [
  { id: 'vocal', label: 'ボーカル' },
  { id: 'dance', label: 'ダンス' },
  { id: 'visual', label: 'ビジュアル' },
]
const roleOptions: Option<IdolRole> = [
  { id: 'scorer', label: 'スコアラー' },
  { id: 'buffer', label: 'バッファー' },
  { id: 'supporter', label: 'サポーター' },
]
const skillTypeOptions1: Option<SkillType> = [
  { id: 'sp', label: 'SPスキル' },
  { id: 'a', label: 'Aスキル' },
]
const skillTypeOptions23: Option<SkillType> = [
  { id: 'a', label: 'Aスキル' },
  { id: 'p', label: 'Pスキル' },
]
const abilityTypeOptions: Option<AbilityDiv> = [
  { id: 'buff', label: '持続効果' },
  { id: 'action-buff', label: '即時効果' },
  { id: 'score', label: 'スコア獲得' },
]
const buffTypeOptions: Option<ExcludeUnknown<BuffAbilityType>> = omitUnknownOption(objToOption(BUFF_ABILITY_TYPE))
const actionBuffTypeOptions: Option<ActionAbilityType> = objToOption(ACTION_ABILITY_TYPE)
const buffTargetOptions: Option<Exclude<ExcludeUnknown<BuffTargetWithoutSuffix>, 'triggered'>> = omitOption(
  'triggered' as const
)(omitUnknownOption(objToOption(BUFF_TARGET_WITHOUT_SUFFIX)))
const buffTargetOptionsIncludingTriggered: Option<ExcludeUnknown<BuffTargetWithoutSuffix>> = omitUnknownOption(
  objToOption(BUFF_TARGET_WITHOUT_SUFFIX)
)
const buffTargetSuffixOptions: Option<BuffTargetCount> = [
  { id: '1', label: '1人' },
  { id: '2', label: '2人' },
  { id: '3', label: '3人' },
]
const conditionOptionsForP: Option<ExcludeUnknown<AbilityConditionType>> = [
  ...omitUnknownOption(objToOption(ABILITY_CONDITION_WITHOUT_VALUE)),
  ...objToOption(ABILITY_CONDITION_WITH_VALUE),
]
const ABILITY_CONDITION_AVAILABLE_FOR_P_ONLY: AbilityConditionType[] = ['a', 'sp']
const conditionOptions = conditionOptionsForP.filter((v) => !ABILITY_CONDITION_AVAILABLE_FOR_P_ONLY.includes(v.id))

const AVAILAVLE_TRIGGER: Record<AbilityConditionType, boolean> = {
  none: false,
  sp: true,
  a: true,
  beat: false,
  critical: false,
  'vocal-up': false,
  'dance-up': false,
  'visual-up': false,
  'eye-catch': false,
  'tension-up': false,
  'critical-up': false,
  'score-up': false,
  'a-score-up': false,
  'sp-score-up': false,
  'beat-score-up': false,
  'cmb-score-up': false,
  'in-vocal-lane': false,
  'in-dance-lane': false,
  'in-visual-lane': false,
  'anyone-vocal-up': true,
  'anyone-dance-up': true,
  'anyone-visual-up': true,
  'anyone-eye-catch': true,
  'anyone-tension-up': true,
  'anyone-critical-up': true,
  unknown: false,
  combo: false,
  'stamina-greater-than': false,
  'stamina-less-than': false,
  'anyone-stamina-less-than': true,
}
const availableTrigger = (t: AbilityConditionType) => AVAILAVLE_TRIGGER[t]

const SKILLS_NAME_PLACEHOLDER = ['太陽の光と共に', '大好きなあのキャラ', '人生の倍返し'] as const
const SKILLS_CT_PLACEHOLDER = ['', '30', ''] as const
const SKILL_LEVEL_MAX = [6, 5, 4] as const

const deriveUnitByBuffType = (type: BuffAbilityType | ActionAbilityType | null): string => {
  switch (type) {
    case 'buff-span':
      return 'ビート延長数'
    case 'ct-reduction':
      return 'CT減少数'
    case 'stamina-recovery':
      return 'スタミナ回復量'
    default:
      return '段階'
  }
}
</script>
<style lang="scss" scoped>
@import '~~/components/partials/token.scss';
@import '~~/components/partials/utils.scss';

.sub-heading {
  @include align;
  color: $text1;
  font-size: $typography-l;
  font-weight: bold;
  margin-top: 16px;
  margin-bottom: 16px;
  display: grid;
  grid: auto / auto 1fr auto auto;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.level-label {
  font-size: $typography-s;
  font-weight: normal;
  color: $text3;
}

.level-toggle {
  display: grid;
  grid: auto / auto-flow min-content;
  gap: 4px;
}

.level-toggle-item {
  @include round-corner;
  @include clickable;
  @include reset-button;

  font-size: $typography-m;
  font-weight: normal;
  color: $text3;
  height: 28px;
  width: 28px;
  display: grid;
  justify-items: center;
  align-items: center;
  border: solid 1px $text3;

  &.active {
    color: $background1;
    background-color: $text1;
    border-color: $text1;
  }
}

.ability {
  @include round-corner;
  border: solid 1px $surface1;
  padding: 8px 0;
  display: grid;
  grid: auto-flow / auto;
  gap: 16px;
  position: relative;
}

.remove-ability {
  @include reset-button;
  @include clickable;
  display: grid;
  width: 24px;
  height: 24px;
  position: absolute;
  top: 0;
  right: 0;
  /* transform: translate(50%, -50%); */
  display: grid;
  align-items: center;
  justify-items: center;
  font-size: $typography-s;
  color: $text3;

  & svg {
    background-color: $background1;
  }
}

.left-main {
  display: grid;
  grid: auto / 1fr;
  grid-auto-flow: column;
  grid-auto-columns: 80px;
  gap: 8px;
}

.new-ability {
  @include reset-button;
  @include round-corner;
  border: solid 1px $surface1;
  font-size: $typography-s;
  color: $text3;
  display: grid;
  grid: auto / auto auto;
  gap: 4px;
  align-items: center;
  justify-content: center;
  height: 40px;
}
</style>
