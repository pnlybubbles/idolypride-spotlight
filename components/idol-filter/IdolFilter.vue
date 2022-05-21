<template>
  <div class="filter">
    <div class="overview">
      <div class="applied">
        <button v-if="modelValue.length === 0" class="filter-item dashed" @click="open = true" @touchend="null">
          フィルターなし
        </button>
        <button
          v-if="modelValue.length === 0 && recentFilter.length !== 0"
          class="filter-item dashed"
          @click="handleApplyRecent"
          @touchend="null"
        >
          最近のフィルタ ({{ recentFilter.map((v) => v.label).join(', ') }})
        </button>
        <button
          v-for="item in modelValue"
          :key="`${item.type}-${item.value}`"
          class="filter-item"
          @click="handleFilter(item)"
          @touchend="null"
        >
          <span v-if="TYPE_TO_LABEL[item.type] !== null" class="type">{{ TYPE_TO_LABEL[item.type] }}</span>
          <span class="value">{{ item.label }}</span>
        </button>
      </div>
      <button class="filter-button" :class="{ active: open }" @click="open = !open" @touchend="null">
        <font-awesome-icon icon="filter"></font-awesome-icon>
      </button>
    </div>
    <div v-if="open" class="details">
      <Section overflow>
        <template #label>名前</template>
        <div class="picker">
          <button
            v-for="id in IDOL_NAME"
            :key="id"
            class="picker-item"
            :class="{ active: isActive('name', id) }"
            @click="handlePick('name', id, id)"
            @touchend="null"
          >
            {{ id }}
          </button>
        </div>
      </Section>
      <Section overflow>
        <template #label>タイプ</template>
        <div class="picker">
          <button
            v-for="(label, id) in IDOL_TYPE"
            :key="id"
            class="picker-item"
            :class="{ active: isActive('type', id) }"
            @click="handlePick('type', id, label)"
            @touchend="null"
          >
            {{ label }}
          </button>
          <button
            v-for="(label, id) in IDOL_ROLE"
            :key="id"
            class="picker-item"
            :class="{ active: isActive('role', id) }"
            @click="handlePick('role', id, label)"
            @touchend="null"
          >
            {{ label }}
          </button>
        </div>
      </Section>
      <template v-if="more">
        <Section overflow>
          <template #label>ユニット</template>
          <div class="picker">
            <button
              v-for="id in FILTERABLE_UNIT_NAME"
              :key="id"
              class="picker-item"
              :class="{ active: isActive('unit', id) }"
              @click="handlePick('unit', id, id)"
              @touchend="null"
            >
              {{ id }}
            </button>
          </div>
        </Section>
        <Section overflow>
          <template #label>効果</template>
          <template #sub>*複数選択はANDで評価されます</template>
          <div class="picker">
            <button
              v-for="item in FILTERABLE_ABILITY_TYPE_OPTION"
              :key="item.id"
              class="picker-item"
              :class="{ active: isActive('ability', item.id) }"
              @click="handlePick('ability', item.id, item.label)"
              @touchend="null"
            >
              {{ item.label }}
            </button>
          </div>
        </Section>
        <Section overflow>
          <template #label>スキル構成</template>
          <div class="picker">
            <button
              v-for="item in FILTERABLE_SKILL_FORMATION_OPTION"
              :key="item.id"
              class="picker-item"
              :class="{ active: isActive('formation', item.id) }"
              @click="handlePick('formation', item.id, item.label)"
              @touchend="null"
            >
              {{ item.label }}
            </button>
          </div>
        </Section>
      </template>
      <Interactive class="more" :class="{ active: more }" @click="more = !more"
        ><font-awesome-icon icon="caret-down" class="icon"></font-awesome-icon>詳細フィルター</Interactive
      >
    </div>
  </div>
</template>
<script setup lang="ts">
import { useIdolFilterRecent } from '~~/composable/localstorage-descriptors'
import {
  IDOL_NAME,
  IDOL_TYPE,
  IDOL_ROLE,
  UNIT_NAME,
  UNIT_TO_IDOL_NAME,
  objToOption,
  omitUnknownOption,
} from '~~/utils/common'
import { ACTION_ABILITY_TYPE, BUFF_ABILITY_TYPE } from '~~/utils/formatter'
import { Filter, FILTERABLE_SKILL_FORMATION, FilterType } from './helper'

const FILTERABLE_UNIT_NAME = UNIT_NAME.filter((unit) => UNIT_TO_IDOL_NAME[unit].length > 2)
const FILTERABLE_ABILITY_TYPE_OPTION = omitUnknownOption(objToOption({ ...BUFF_ABILITY_TYPE, ...ACTION_ABILITY_TYPE }))
const FILTERABLE_SKILL_FORMATION_OPTION = objToOption(FILTERABLE_SKILL_FORMATION)

interface Props {
  modelValue: Filter[]
}
const props = defineProps<Props>()
interface Emits {
  (e: 'update:modelValue', value: Filter[]): void
}
const emit = defineEmits<Emits>()

const open = ref(false)

const filterEq = (a: Filter, b: Filter) => a.type === b.type && a.value === b.value

const [recentFilter] = useIdolFilterRecent()

const handleFilter = (item: Filter) => {
  const newFilter = props.modelValue.filter((v) => !filterEq(v, item))
  emit('update:modelValue', newFilter)
  recentFilter.value = newFilter
}

const handlePick = (type: FilterType, value: string, label: string) => {
  const item = { type, value, label }
  if (props.modelValue.find((v) => filterEq(v, item))) {
    return handleFilter(item)
  }
  const newFilter = [...props.modelValue, item]
  emit('update:modelValue', newFilter)
  recentFilter.value = newFilter
}

const handleApplyRecent = () => {
  emit('update:modelValue', recentFilter.value)
}

const isActive = (type: FilterType, value: string) => props.modelValue.find((v) => v.type === type && v.value === value)

const TYPE_TO_LABEL: Record<FilterType, string | null> = {
  name: '名前',
  unit: 'ユニット',
  type: null,
  role: null,
  ability: '効果',
  formation: 'スキル構成',
}

const more = ref(false)
</script>
<style lang="scss" scoped>
@import '~~/components/partials/token.scss';
@import '~~/components/partials/utils.scss';

.filter {
  display: grid;
  gap: 8px;
}

.overview {
  @include align;
  display: grid;
  grid: auto / 1fr auto;
  align-items: center;
  min-width: 0;
}

.details {
  display: grid;
  gap: 8px;
}

.applied {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.filter-item {
  @include reset-button;
  @include clickable;
  @include round-corner;

  font-size: $typography-xs;
  background-color: $surface1;
  color: $text1;
  padding: 4px 8px;
  text-align: left;

  & .type {
    color: $text3;
    margin-right: 4px;
  }

  & .value {
    color: $text1;
  }

  &.dashed {
    color: $text3;
    background-color: unset;
    border: 1px dashed $text3;
  }
}

.filter-button {
  @include reset-button;
  @include clickable;

  font-size: $typography-xs;
  height: 32px;
  width: 32px;
  display: grid;
  align-items: center;
  justify-items: center;
  border-radius: 50%;
  background-color: $surface1;
  color: $text1;
  align-self: flex-start;
  border: solid 1px transparent;
  margin: -1px;

  &.active {
    border-color: $text1;
  }

  svg {
    margin-bottom: -2px;
  }
}

.picker {
  display: grid;
  grid: auto / auto-flow;
  gap: 8px;
}

.picker-item {
  @include reset-button;
  @include clickable;
  @include round-corner;

  font-size: $typography-xs;
  background-color: $surface1;
  color: $text1;
  padding: 4px 8px;
  white-space: nowrap;
  border: solid 1px transparent;
  margin: 0 -1px;

  &.active {
    border-color: $text1;
  }
}

.more {
  font-size: $typography-s;
  color: $text3;
  text-align: center;

  .icon {
    margin-right: 4px;
  }

  &.active {
    .icon {
      transform: rotate(180deg);
    }
  }
}
</style>
