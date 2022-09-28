<template>
  <VStack :spacing="16">
    <Section>
      <template #label>名前</template>
      <Listbox v-model="idolInput.name" :options="nameOptions" required></Listbox>
    </Section>
    <Section>
      <template #label>カード名</template>
      <IdolTitleField v-model="idolInput.title" :editing-idol-id="idolInput.id"></IdolTitleField>
    </Section>
    <Section>
      <template #label>属性</template>
      <HStack :spacing="8">
        <Listbox v-model="idolInput.type" :options="typeOptions" required></Listbox>
        <Listbox v-model="idolInput.role" :options="roleOptions" required></Listbox>
      </HStack>
    </Section>
    <div v-for="[skill, skillData] in idolInput.skills.map(zipIdolSkill)" :key="skill.index">
      <div class="sub-heading">
        <div>スキル{{ skill.index + 1 }}</div>
        <div></div>
        <div class="level-label">Level</div>
        <div class="level-toggle">
          <button
            v-for="level in SKILL_LEVEL_MAX[skill.index]"
            :key="level"
            class="level-toggle-item"
            :class="{
              active: level === skillLevel[skill.index],
              marked: level === skill.level,
            }"
            @click="skillLevel[skill.index] = level"
            @touchend="null"
          >
            {{ level }}
          </button>
        </div>
      </div>
      <Section v-if="skillLevel[skill.index] !== skill.level">
        <template v-if="skillData">
          <div class="skill-header">
            <SkillTag :skill="skillData" mini></SkillTag>
            <div class="skill-name">{{ skillData.name }}</div>
          </div>
          <SkillText class="skill-text" :skill="skillData" delimiter="newline" :with-lv="false"></SkillText>
        </template>
        <NoteText v-else>データ無し</NoteText>
        <Button variant="secondary" @click="handleStartEditingLevel(skill.index)">
          <template v-if="skillData">レベル {{ skillLevel[skill.index] }} の編集を開始する</template>
          <template v-else>レベル {{ skillLevel[skill.index] }} の入力を開始する</template>
        </Button>
      </Section>
      <!-- skill.level が null のときは編集中ではないのでアンマウント -->
      <!-- 編集中のときはshowで表示制御をしておいてインスタンスを保持しておく -->
      <!-- (入力途中のフォームはマウントしておくと`useForm`のバリデーションチェックが効く) -->
      <VStack v-show="skillLevel[skill.index] === skill.level" v-if="skill.level !== null" :spacing="16">
        <Section v-if="copiedFromLevel[skill.index] !== null">
          <NoteText variant="info">Level {{ copiedFromLevel[skill.index] }} からデータがコピーされました</NoteText>
        </Section>
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
        <Section v-if="skill.type === 'p'">
          <template #label>発動トリガー</template>
          <NoteText>Pスキル発動のきっかけとなるイベント</NoteText>
          <div class="left-main">
            <Listbox v-model="skill.trigger" :options="triggerOptions" required></Listbox>
            <TextField
              v-if="isSkillTriggerWithValue(skill.trigger)"
              v-model="skill.triggerValue"
              placeholder="X"
              type="number"
              required
            ></TextField>
          </div>
        </Section>
        <Section v-if="skill.type !== 'sp'">
          <template #label>CT</template>
          <HStack :spacing="8">
            <TextField
              :model-value="availableSkillOnce(skill.type) && skill.once ? 'なし' : skill.ct"
              :placeholder="SKILLS_CT_PLACEHOLDER[skill.index]"
              :disabled="availableSkillOnce(skill.type) && skill.once"
              type="number"
              required
              :preset="[30, 40, 50, 60, 70]"
              @update:model-value="skill.ct = $event"
            ></TextField>
            <Check v-if="availableSkillOnce(skill.type)" v-model="skill.once">ライブ中1回</Check>
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
                <Listbox v-model="ability.condition" :options="conditionOptions" required></Listbox>
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
                    skill.type === 'p' && availableTrigger(skill.trigger)
                      ? buffTargetOptionsIncludingTriggered
                      : buffTargetOptions
                  "
                  required
                ></Listbox>
                <Listbox
                  v-if="ability.target && isBuffTargetWithSuffix(ability.target)"
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
            <template v-else-if="ability.div === 'score'">
              <Section :gutter="8">
                <template #label>スコア</template>
                <TextField v-model="ability.amount" placeholder="1000" type="number" required></TextField>
              </Section>
              <Section :gutter="8">
                <template #label>効果上昇</template>
                <Listbox v-model="ability.enhance" :options="enhanceOptions" required></Listbox>
                <TextField
                  v-if="isAbilityEnhanceWithValue(ability.enhance)"
                  v-model="ability.enhanceValue"
                  type="number"
                  required
                ></TextField>
              </Section>
            </template>
          </div>
          <button class="new-ability" @click="handleAddAbility(skill)" @touchend="null">
            <font-awesome-icon icon="circle-plus"></font-awesome-icon>
            <div>効果を追加する</div>
          </button>
        </Section>
      </VStack>
    </div>
    <Section>
      <Button :disabled="disabled" @click="handleConfirm">{{ confirmAndSubmitLabel }}</Button>
    </Section>
    <Sheet v-model:present="isPresentConfirm">
      <VStack :spacing="16">
        <IdolItem v-if="formattedIdol" :idol="formattedIdol" variant="big" no-event></IdolItem>
        <Section>
          <Button :disabled="disabled" @click="handleSubmit">{{ submitLabel }}</Button>
        </Section>
      </VStack>
    </Sheet>
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
  BuffTargetPrefix,
  IdolData,
  SkillTriggerType,
  SkillIndex,
} from '~~/utils/types'
import {
  ABILITY_CONDITION_WITHOUT_VALUE,
  ABILITY_CONDITION_WITH_VALUE,
  ABILITY_ENHANCE,
  ACTION_ABILITY_TYPE,
  BUFF_ABILITY_TYPE,
  BUFF_TARGET_PREFIX,
  isAbilityConditionWithValue,
  isAbilityEnhanceWithValue,
  isBuffTargetWithSuffix,
  isSkillTriggerWithValue,
  pickSkillsByLevel,
  SKILL_TRIGGER_WITHOUT_VALUE,
  SKILL_TRIGGER_WITH_VALUE,
} from '~~/utils/formatter'
import {
  defaultIdolInput,
  formatIdol,
  IdolInput,
  deriveDisabledAmount,
  defaultAbilityInput,
  deformatIdol,
  deformatSkill,
  SkillInput,
  disableSpan,
  availableSkillOnce,
} from './helper'
import { ArrayN, defined, lift, mapArrayN } from '~~/utils'
import {
  arrayToOption,
  ExcludeUnknown,
  IDOL_NAME,
  objToOption,
  omitOption,
  omitUnknownOption,
  Option,
  SKILLS,
  SKILL_LEVEL_MAX,
} from '~~/utils/common'
import equal from 'deep-equal'
import { useFormComponent } from '~~/composable/form'

interface Props {
  idol?: IdolData
  disabled: boolean
  confirmAndSubmitLabel: string
  submitLabel: string
}
const props = defineProps<Props>()
interface Emits {
  (e: 'submit', value: IdolData): void
}
const emit = defineEmits<Emits>()

const initIdolInput = props.idol ? deformatIdol(props.idol) : defaultIdolInput()
const idolInput = reactive<IdolInput>(initIdolInput)
useFormComponent(
  computed(() => ({
    error: SKILLS.some(
      // 必ず各スキルは一つ以上のレベルのデータが存在しなければならない
      (i) => idolInput.skills[i].level === null && props.idol?.skills.find((v) => v.index === i) === undefined
    ),
  }))
)

const skillLevel = reactive(
  props.idol ? mapArrayN(pickSkillsByLevel(props.idol.skills), (v) => v.level) : ([1, 1, 1] as ArrayN<number, 3>)
)

const copiedFromLevel = reactive([null, null, null] as ArrayN<null | number, 3>)
const skillInputCache = [null, null, null] as ArrayN<null | SkillInput, 3>

const handleStartEditingLevel = (index: SkillIndex) => {
  const level = idolInput.skills[index].level
  // 編集中の場合は入力が破棄されるので確認を出す
  if (level !== null) {
    if (!equal(toRaw(idolInput.skills[index]), skillInputCache[index])) {
      if (!confirm('編集中のスキルレベルのデータを破棄して新しいスキルレベルの編集を開始します')) {
        return
      }
    }
  }
  const newLevel = skillLevel[index]
  const newSkill = idolSkill(index, newLevel)
  if (newSkill) {
    // 編集の場合
    idolInput.skills[index] = deformatSkill(newSkill, index)
    copiedFromLevel[index] = null
  } else {
    // 新規の場合
    // 近いレベルからデータを引っ張ってきてベースにする
    const nearestSkill = props.idol?.skills
      .filter((v) => v.index === index)
      .sort((a, b) => {
        const cmp = Math.abs(a.level - newLevel) - Math.abs(b.level - newLevel)
        // 同率だった場合は下のレベルを優先
        return cmp === 0 ? -1 : cmp
      })[0]
    if (nearestSkill) {
      idolInput.skills[index] = deformatSkill(nearestSkill, index)
      copiedFromLevel[index] = nearestSkill.level
    } else {
      idolInput.skills[index] = defaultIdolInput().skills[index]
      copiedFromLevel[index] = null
    }
    // 記入中のレベルを指定
    idolInput.skills[index].level = newLevel
    // idを空文字にすることで新規追加を明示する (formatIdolの仕様)
    idolInput.skills[index].id = ''
    for (const ability of idolInput.skills[index].ability) {
      ability.id = ''
    }
  }
  skillInputCache[index] = structuredClone(toRaw(idolInput.skills[index])) as SkillInput
}

const idolSkill = (index: SkillIndex, level: number) =>
  props.idol?.skills.find((v) => v.index === index && v.level === level)

const zipIdolSkill = (input: SkillInput) => {
  const level = skillLevel[input.index]
  return [input, level !== null ? idolSkill(input.index, level) : undefined] as const
}

const handleAddAbility = (skill: SkillInput) => {
  const currentSkill = defined(idolInput.skills.find((v) => v.index === skill.index))
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
  if (!confirm('効果を削除します')) {
    return
  }
  idolInput.skills.find((v) => v.index === skill.index)?.ability.splice(abilityIndex, 1)
}

const handleConfirm = () => {
  isPresentConfirm.value = true
}

const handleSubmit = () => {
  if (!formattedIdol.value) {
    isPresentConfirm.value = false
    return
  }
  emit('submit', formattedIdol.value)
  isPresentConfirm.value = false
}

const formattedIdol = computed({
  get: () => (isPresentConfirm.value ? formatIdol(idolInput, props.idol) : null),
  set: (value) => (isPresentConfirm.value = value !== null),
})
const isPresentConfirm = ref(false)

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
const buffTargetOptions: Option<Exclude<ExcludeUnknown<BuffTargetPrefix>, 'triggered'>> = omitOption(
  'triggered' as const
)(omitUnknownOption(objToOption(BUFF_TARGET_PREFIX)))
const buffTargetOptionsIncludingTriggered: Option<ExcludeUnknown<BuffTargetPrefix>> = omitUnknownOption(
  objToOption(BUFF_TARGET_PREFIX)
)
const buffTargetSuffixOptions: Option<BuffTargetCount> = [
  { id: '1', label: '1人' },
  { id: '2', label: '2人' },
  { id: '3', label: '3人' },
]
const conditionOptions: Option<ExcludeUnknown<AbilityConditionType>> = [
  ...omitUnknownOption(objToOption(ABILITY_CONDITION_WITHOUT_VALUE)),
  ...objToOption(ABILITY_CONDITION_WITH_VALUE),
]
const enhanceOptions = omitUnknownOption(objToOption(ABILITY_ENHANCE))
const triggerOptions: Option<ExcludeUnknown<SkillTriggerType>> = [
  ...omitUnknownOption(objToOption(SKILL_TRIGGER_WITHOUT_VALUE)),
  ...objToOption(SKILL_TRIGGER_WITH_VALUE),
]

/**
 * バフ対象の選択肢に'発動トリガーの対象'を出すかどうか
 */
const AVAILAVLE_TRIGGER: Record<SkillTriggerType, boolean> = {
  none: false,
  sp: true,
  'self-sp': false,
  a: true,
  beat: false,
  critical: false,
  'vocal-up': false,
  'dance-up': false,
  'visual-up': false,
  'eye-catch': false,
  debuff: false,
  'tension-up': false,
  'critical-up': false,
  'score-up': false,
  'a-score-up': false,
  'sp-score-up': false,
  'beat-score-up': false,
  'cmb-score-up': false,
  'anyone-vocal-up': true,
  'anyone-dance-up': true,
  'anyone-visual-up': true,
  'anyone-eye-catch': true,
  'anyone-debuff': true,
  'anyone-tension-up': true,
  'anyone-critical-up': true,
  'anyone-score-up': true,
  'anyone-a-score-up': true,
  'anyone-sp-score-up': true,
  'anyone-beat-score-up': true,
  'anyone-cmb-score-up': true,
  unknown: false,
  combo: false,
  'combo-less-than': false,
  'stamina-greater-than': false,
  'stamina-less-than': false,
  'anyone-stamina-less-than': true,
  'critical-score-up': false,
  'anyone-critical-score-up': true,
}
const availableTrigger = (t: SkillTriggerType) => AVAILAVLE_TRIGGER[t]

const SKILLS_NAME_PLACEHOLDER = ['太陽の光と共に', '大好きなあのキャラ', '人生の倍返し'] as const
const SKILLS_CT_PLACEHOLDER = ['', '30', ''] as const

const deriveUnitByBuffType = (type: BuffAbilityType | ActionAbilityType | null): string => {
  switch (type) {
    case 'buff-span':
      return 'ビート延長数'
    case 'ct-reduction':
      return 'CT減少数'
    case 'stamina-recovery':
      return 'スタミナ回復量'
    case 'stamina-recovery-percentage':
      return 'スタミナ回復量(%)'
    case 'stamina-loss':
      return 'スタミナ消費量'
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
  position: relative;

  &.active {
    color: $background1;
    background-color: $text1;
    border-color: $text1;
  }

  &.marked::before {
    content: '';
    position: absolute;
    display: block;
    width: 8px;
    height: 8px;
    border-radius: 4px;
    background-color: $text1;
    right: -3px;
    top: -3px;
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
  @include clickable;
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

.skill-header {
  display: grid;
  grid: auto / auto auto;
  gap: 8px;
  align-items: center;
  width: max-content;
}

.skill-name {
  font-size: $typography-s;
  color: $text1;
}

.skill-text {
  color: $text3;
}
</style>
