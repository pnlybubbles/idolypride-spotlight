<template>
  <div class="filter">
    <div class="overview">
      <div class="applied">
        <button v-if="modelValue.length === 0" class="filter-item empty" @click="open = true" @touchend="null">
          フィルターなし
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
      <button class="filter-button" @click="open = !open" @touchend="null">
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
            @click="handlePick('name', id, id)"
            @touchend="null"
          >
            {{ id }}
          </button>
        </div>
      </Section>
      <Section overflow>
        <template #label>ユニット</template>
        <div class="picker">
          <button
            v-for="id in FILTERABLE_UNIT_NAME"
            :key="id"
            class="picker-item"
            @click="handlePick('unit', id, id)"
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
            @click="handlePick('type', id, label)"
            @touchend="null"
          >
            {{ label }}
          </button>
          <button
            v-for="(label, id) in IDOL_ROLE"
            :key="id"
            class="picker-item"
            @click="handlePick('role', id, label)"
            @touchend="null"
          >
            {{ label }}
          </button>
        </div>
      </Section>
    </div>
  </div>
</template>
<script setup lang="ts">
import { IDOL_NAME, IDOL_TYPE, IDOL_ROLE, UNIT_NAME, UNIT_TO_IDOL_NAME } from '~~/utils/common'
import { Filter, FilterType } from './helper'

const FILTERABLE_UNIT_NAME = UNIT_NAME.filter((unit) => UNIT_TO_IDOL_NAME[unit].length > 2)

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

const handleFilter = (item: Filter) => {
  emit(
    'update:modelValue',
    props.modelValue.filter((v) => !filterEq(v, item))
  )
}

const handlePick = (type: FilterType, value: string, label: string) => {
  if (props.modelValue.find((v) => filterEq(v, { type, value, label }))) {
    return
  }
  emit('update:modelValue', [...props.modelValue, { type, value, label }])
}

const TYPE_TO_LABEL: Record<FilterType, string | null> = {
  name: '名前',
  unit: 'ユニット',
  type: null,
  role: null,
}
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

  font-size: 12px;
  background-color: $surface1;
  color: $text1;
  padding: 4px 8px;
  white-space: nowrap;

  & .type {
    color: $text3;
    margin-right: 4px;
  }

  & .value {
    color: $text1;
  }

  &.empty {
    color: $text3;
    background-color: unset;
    border: 1px dashed $text3;
  }
}

.filter-button {
  @include reset-button;
  @include clickable;

  font-size: 12px;
  height: 32px;
  width: 32px;
  display: grid;
  align-items: center;
  justify-items: center;
  border-radius: 50%;
  background-color: $surface1;
  align-self: flex-start;

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

  font-size: 12px;
  background-color: $surface1;
  color: $text1;
  padding: 4px 8px;
  white-space: nowrap;
}
</style>
