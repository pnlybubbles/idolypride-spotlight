<template>
  <Dropdown v-model:present="dropdownPresent" :options="options" @select="handleDropdownSelect">
    <Interactive class="idol-select" @click.stop="handleClick" @long-press="handleLongPress">
      <div v-if="modelValue" class="selected">
        <div class="title">{{ modelValue.title }}</div>
        <div class="name">{{ modelValue.name }}</div>
        <div class="type" :class="[modelValue.type, { mismatch }]"></div>
        <div class="type" :class="[laneType, { mismatch }]"></div>
      </div>
      <div v-else class="not-selected">未選択</div>
    </Interactive>
  </Dropdown>
  <Sheet v-model:present="present" fixed no-padding>
    <div class="container">
      <div class="controlls">
        <IdolFilter v-model="filter"></IdolFilter>
      </div>
      <div class="scrolling">
        <ul class="options">
          <li v-if="fetching" class="loading"><Spinner></Spinner></li>
          <li v-for="item in filteredIdolList" :key="item.id">
            <Virtualize>
              <IdolItem :idol="item" @click="handleSelect(item)"></IdolItem>
            </Virtualize>
          </li>
        </ul>
      </div>
    </div>
  </Sheet>
  <Sheet v-model:present="detailPresent">
    <VStack :spacing="16">
      <IdolItem
        v-if="originalIdol !== null"
        v-model:skill-levels="selectedLevels"
        :idol="originalIdol"
        variant="big"
        no-event
      ></IdolItem>
      <Section>
        <IdolItemSkillLevelsSaveButton
          v-if="originalIdol !== null"
          :idol="originalIdol"
          :skill-levels="selectedLevels"
        ></IdolItemSkillLevelsSaveButton>
      </Section>
    </VStack>
  </Sheet>
  <ListboxSheet
    v-model:present="laneTypePresent"
    :model-value="laneType ?? modelValue?.type ?? null"
    :options="laneTypeOptions"
    @update:model-value="$emit('update:laneType', $event as IdolType)"
  ></ListboxSheet>
</template>
<script setup lang="ts">
import { useQuery } from '@urql/vue'
import { useAuth } from '~~/composable/auth0'
import { GetIdolListDocument } from '~~/generated/graphql'
import { deserializeIdolList } from '~~/utils/formatter'
import { IdolData, IdolType } from '~~/utils/types'
import { Filter, idolFilter, idolSort } from './idol-filter/helper'
import { useError } from '~~/composable/error'
import { ArrayN, unreachable } from '~~/utils'
import { IDOL_TYPE, objToOption } from '~~/utils/common'

interface Props {
  modelValue: null | IdolData
  laneType: null | IdolType
}
const props = defineProps<Props>()
interface Emits {
  (e: 'update:modelValue', value: null | IdolData): void
  (e: 'update:laneType', value: IdolType): void
}
const emit = defineEmits<Emits>()

const { notAuthenticated } = useAuth()
const { data, fetching, error } = useQuery({
  query: GetIdolListDocument,
  pause: notAuthenticated,
})
useError(error)
const idolList = computed(() => (data.value ? deserializeIdolList(data.value) : []))
const filteredIdolList = computed(() => idolSort(idolFilter(idolList.value, filter.value)))
const originalIdol = computed(() => idolList.value.find((v) => v.id === props.modelValue?.id) ?? null)

const present = ref(false)
const dropdownPresent = ref(false)
const detailPresent = ref(false)
const laneTypePresent = ref(false)

const handleClick = () => {
  if (dropdownPresent.value) {
    dropdownPresent.value = false
    return
  }
  if (props.modelValue === null) {
    present.value = true
  } else {
    dropdownPresent.value = true
  }
}

const handleLongPress = () => {
  if (props.modelValue === null) {
    return
  }
  detailPresent.value = true
}

const handleReset = () => {
  emit('update:modelValue', null)
  detailPresent.value = false
  selectedLevels.value = null
}

const handleSelect = (item: IdolData) => {
  present.value = false
  // 無駄な描画更新をトリガしない
  if (item.id === props.modelValue?.id) {
    return
  }
  emit('update:modelValue', item)
  selectedLevels.value = null
}

const filter = ref<Filter[]>([])

const selectedLevels = ref<ArrayN<number, 3> | null>(null)

// 擬似的にownedの中身を書き換えてモックする
const overrideOwnedSkillLevels = (idol: IdolData, levels: ArrayN<number, 3>): IdolData => ({
  ...idol,
  owned: { skillLevels: levels },
})

watch(selectedLevels, (v) => {
  if (props.modelValue === null || v === null) {
    return
  }
  emit('update:modelValue', overrideOwnedSkillLevels(props.modelValue, v))
})

const options = [
  { label: '詳細...', value: 'detail' },
  { label: '変更する', value: 'change' },
  { label: '未選択に戻す', value: 'unselect' },
  { label: 'レーンタイプを変更する', value: 'type' },
] as const

const handleDropdownSelect = (value: string) => {
  const action = value as typeof options[number]['value']
  if (action === 'detail') {
    detailPresent.value = true
  } else if (action === 'change') {
    present.value = true
  } else if (action === 'unselect') {
    handleReset()
  } else if (action === 'type') {
    laneTypePresent.value = true
  } else {
    unreachable(action)
  }
}

const laneTypeOptions = objToOption(IDOL_TYPE)
const mismatch = computed(
  () => props.laneType !== null && props.modelValue !== null && props.laneType !== props.modelValue.type
)
</script>
<style lang="scss" scoped>
@import '~~/components/partials/token.scss';
@import '~~/components/partials/utils.scss';

.idol-select {
  width: 100%;
  height: 56px;
}

.not-selected {
  font-size: $typography-s;
  color: $text3;
}

.selected {
  display: grid;
  grid: auto auto / auto;
  align-content: end;
  height: 100%;
}

.title {
  font-size: $typography-s;
  width: 100%;
  overflow: hidden;
  white-space: nowrap;
  position: relative;
  mask-image: linear-gradient(-90deg, transparent 0, #000 20px);
}

.name {
  font-size: $typography-s;
  color: $text3;
  width: 100%;
  overflow: hidden;
  white-space: nowrap;
}

.type {
  margin-top: 2px;
  width: 100%;
  height: 2px;

  &.vocal {
    --color: #{$vocal};
  }

  &.dance {
    --color: #{$dance};
  }

  &.visual {
    --color: #{$visual};
  }

  background-color: var(--color);

  &.mismatch {
    background: repeating-linear-gradient(45deg, var(--color), var(--color) 2px, transparent 2px, transparent 4px);
  }
}

.options {
  list-style: none;
  margin: 0;
  padding: 0;
  padding-bottom: 40px;
  display: grid;
  gap: 16px;
}

.controlls {
  @include bloom(black);
  padding: 24px 0 16px;
  background-color: $background1;
}

.container {
  height: 100%;
  display: grid;
  grid: auto 1fr / auto;
}

.scrolling {
  overflow-y: auto;
}

.loading {
  display: grid;
  justify-content: center;
}
</style>
