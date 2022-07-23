<template>
  <div class="idol-item">
    <button class="heading" :class="{ event: !noEvent }" @click="!noEvent && $emit('click')" @touchend="null">
      <div class="type" :class="idol.type">
        <RoleIcon :role="idol.role" class="role"></RoleIcon>
      </div>
      <div>
        <span class="title">{{ idol.title }}</span>
        <span class="name">{{ idol.name }}</span>
      </div>
    </button>
    <div v-if="variant !== 'oneline'" class="status">
      <div v-if="variant !== 'big'" class="skill-overview">
        <SkillTag v-for="skill in skills" :key="skill.id" :skill="skill"></SkillTag>
      </div>
      <div v-if="variant === 'default'" class="skill-list default">
        <SkillText v-for="skill in skills" :key="skill.id" :skill="skill" class="skill-item"></SkillText>
      </div>
      <div v-else-if="variant === 'big'" class="skill-list big">
        <div v-for="i in SKILLS" :key="i" class="skill-item">
          <div class="skill-title">
            <div class="skill-left">
              <SkillTag :skill="skills[i]" mini></SkillTag>
              <div class="skill-name">{{ skills[i].name }}</div>
            </div>
            <div class="skill-right">
              <Badge v-if="editing[i].value" warning>未保存</Badge>
              <InlineMenu
                v-model="mappedSkillLevels[i].value"
                :options="levelOptions[i]"
                class="skill-level"
              ></InlineMenu>
            </div>
          </div>
          <SkillText :skill="skills[i]" delimiter="newline" class="skill-detail" :with-lv="false"></SkillText>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { pickSkillsByLevel } from '~~/utils/formatter'
import { IdolData } from '~~/utils/types'
import { ArrayN, mapArrayN, safeParseInt, unitArrayN } from '~~/utils'
import { SKILL_LEVEL_MAX, SKILLS } from '~~/utils/common'

interface Props {
  idol: IdolData
  noEvent?: boolean
  variant?: 'default' | 'mini' | 'oneline' | 'big'
  skillLevels?: ArrayN<number, 3> | null
}
const props = withDefaults(defineProps<Props>(), {
  variant: 'default',
  noEvent: false,
  skillLevels: null,
})

const uncontrolledSelectedLevels = ref(unitArrayN(3, null as null | number))
const maxSkillLevels = computed(() => mapArrayN(pickSkillsByLevel(props.idol.skills), (v) => v.level))
const skillLevels = computed({
  get: () =>
    mapArrayN(
      SKILLS,
      (i) =>
        props.skillLevels?.[i] ??
        uncontrolledSelectedLevels.value[i] ??
        props.idol.owned?.skillLevels?.[i] ??
        maxSkillLevels.value[i]
    ),
  set: (value) => {
    uncontrolledSelectedLevels.value = value
    emit('update:skillLevels', value)
  },
})
const skills = computed(() => pickSkillsByLevel(props.idol.skills, skillLevels.value))

const mappedSkillLevels = mapArrayN(SKILLS, (i) =>
  computed({
    get: () => skillLevels.value[i].toString(),
    set: (value) =>
      (skillLevels.value = mapArrayN(skillLevels.value, (v, j) => (i === j ? safeParseInt(value) ?? 1 : v))),
  })
)

interface Emits {
  (e: 'click'): void
  (e: 'update:skillLevels', value: ArrayN<number, 3>): void
}
const emit = defineEmits<Emits>()

const levelOptions = mapArrayN(SKILL_LEVEL_MAX, (maxLevel, index) =>
  Array.from({ length: maxLevel }).map((_, i) => ({
    id: (i + 1).toString(),
    label: `Lv. ${i + 1}`,
    disabled: props.idol.skills.find((v) => v.index === index && v.level === i + 1) === undefined,
  }))
)

const editing = mapArrayN(SKILLS, (i) =>
  computed(() => props.idol.owned !== null && skillLevels.value[i] !== props.idol.owned.skillLevels?.[i])
)
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
  @include align;
  display: grid;
  grid: auto / auto-flow;
  justify-content: start;
  align-items: center;
  gap: 8px;

  &.event {
    @include clickable;
  }
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
  grid: auto-flow / auto;
  gap: 10px;
}

.skill-overview {
  @include align;
  display: grid;
  grid: auto / auto-flow;
  gap: 8px;
  justify-content: start;
}

.skill-list.default {
  display: grid;
  grid: auto-flow / auto;
  gap: 8px;
  overflow-x: auto;
  width: 100%;
  padding-bottom: 10px;
  margin-bottom: -10px;

  .skill-item {
    @include align;
    color: $text3;
  }
}

.skill-list.big {
  @include align;
  display: grid;
  gap: 8px;

  .skill-item {
    display: grid;
    gap: 4px;
  }

  .skill-title {
    display: grid;
    grid: auto / auto auto;
    justify-content: space-between;
    align-items: center;
  }

  .skill-left {
    display: grid;
    grid: auto / auto-flow;
    gap: 8px;
    align-items: center;
  }

  .skill-right {
    display: grid;
    grid: auto / auto-flow;
    gap: 8px;
    align-items: center;
  }

  .skill-name {
    font-size: $typography-s;
    color: $text1;
  }

  .skill-detail {
    color: $text3;
  }

  .skill-level {
    display: grid;
    grid: auto / auto auto;
    gap: 4px;
    align-items: center;
    color: $text1;
    font-size: $typography-s;
  }
}
</style>
