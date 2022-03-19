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
          <span class="type">{{ TYPE_TO_LABEL[item.type] }}</span>
          <span class="value">{{ item.value }}</span>
        </button>
      </div>
      <button class="filter-button" @click="open = !open" @touchend="null">
        <font-awesome-icon icon="filter"></font-awesome-icon>
      </button>
    </div>
    <div v-if="open">
      <Section overflow>
        <template #label>名前</template>
        <div class="picker">
          <button v-for="item in IDOL_NAME" :key="item" class="picker-item" @click="handlePick(item)" @touchend="null">
            {{ item }}
          </button>
        </div>
      </Section>
    </div>
  </div>
</template>
<script setup lang="ts">
import { IDOL_NAME } from '~~/utils/common'
import { Filter } from './types'

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

const handlePick = (value: string) => {
  if (props.modelValue.find((v) => filterEq(v, { type: 'name', value }))) {
    return
  }
  emit('update:modelValue', [...props.modelValue, { type: 'name', value }])
}

const TYPE_TO_LABEL: Record<Filter['type'], string> = {
  name: '名前',
}
</script>
<style lang="scss">
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
