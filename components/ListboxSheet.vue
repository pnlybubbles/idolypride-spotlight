<template>
  <Sheet :present="present" @update:present="$emit('update:present', $event)">
    <ul class="options">
      <li v-for="item in options" :key="item.id" class="item">
        <button class="button" @click="handleClick(item.id)" @touchend="null">
          <font-awesome-icon
            class="check"
            icon="check"
            :class="{ checked: item.id === modelValue }"
          ></font-awesome-icon>
          <div>{{ item.label }}</div>
        </button>
      </li>
    </ul>
  </Sheet>
</template>
<script setup lang="ts">
interface Option {
  id: string
  label: string
}

interface Props {
  present: boolean
  modelValue: string | null
  options: Option[]
}
defineProps<Props>()

interface Emits {
  (e: 'update:present', value: boolean): void
  (e: 'update:modelValue', value: string): void
}
const emit = defineEmits<Emits>()

const handleClick = (item: string) => {
  emit('update:modelValue', item)
  emit('update:present', false)
}
</script>
<style lang="scss" scoped>
@import '~~/components/partials/token.scss';
@import '~~/components/partials/utils.scss';

.options {
  list-style: none;
  margin: 0;
  padding: 0;
}

.button {
  @include reset-button;
  @include align;
  padding-top: 8px;
  padding-bottom: 8px;
  width: 100%;
  text-align: start;
  user-select: none;
  transition: all 0.1s;
  display: grid;
  grid: auto / auto 1fr;
  align-items: center;
  gap: 12px;

  &:active {
    background-color: $surface1;
  }
}

.check {
  opacity: 0;

  &.checked {
    opacity: 1;
  }
}
</style>
