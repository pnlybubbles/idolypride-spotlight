<template>
  <Interactive class="idol-select" @click="present = true" @long-press="handleLongPress">
    <div v-if="modelValue" class="selected">
      <div class="title">{{ modelValue.title }}</div>
      <div class="name">{{ modelValue.name }}</div>
    </div>
    <div v-else class="not-selected">未選択</div>
  </Interactive>
  <Sheet v-model:present="present" fixed no-padding>
    <div class="container">
      <div class="controlls">
        <IdolFilter v-model="filter"></IdolFilter>
      </div>
      <div class="scrolling">
        <ul class="options">
          <li v-if="fetching" class="loading"><Spinner></Spinner></li>
          <li v-for="item in filteredIdolList" :key="item.id">
            <IdolItem :idol="item" @click="handleClick(item)"></IdolItem>
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
        <Button @click="handleReset">未選択に戻す</Button>
      </Section>
    </VStack>
  </Sheet>
</template>
<script setup lang="ts">
import { useQuery } from '@urql/vue'
import { useAuth } from '~~/composable/auth0'
import { GetIdolListDocument } from '~~/generated/graphql'
import { deserializeIdolList } from '~~/utils/formatter'
import { IdolData } from '~~/utils/types'
import { Filter, idolFilter, idolSort } from './idol-filter/helper'
import { useError } from '~~/composable/error'
import { ArrayN } from '~~/utils'

interface Props {
  modelValue: null | IdolData
}
const props = defineProps<Props>()
interface Emits {
  (e: 'update:modelValue', value: null | IdolData): void
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

const detailPresent = ref(false)

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

const handleClick = (item: IdolData) => {
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
</script>
<style lang="scss" scoped>
@import '~~/components/partials/token.scss';
@import '~~/components/partials/utils.scss';

.idol-select {
  display: grid;
  align-content: center;
  height: 56px;
}

.not-selected {
  font-size: $typography-s;
  color: $text3;
}

.selected {
  display: grid;
  grid: auto auto / auto;
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
