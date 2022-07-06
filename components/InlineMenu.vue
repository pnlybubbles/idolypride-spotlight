<template>
  <div class="menu">
    <Interactive class="button" @click.stop="isPresent = !isPresent">
      <font-awesome-icon icon="caret-down"></font-awesome-icon>
      <div>{{ selected?.label ?? placeholder ?? '未選択' }}</div>
    </Interactive>
    <div v-if="isPresent" class="select" @click.stop>
      <button
        v-for="item in options"
        :key="item.id"
        class="option"
        :class="{ active: item.id === modelValue }"
        :disabled="item.disabled ?? false"
        @click.stop="$emit('update:modelValue', item.id)"
        @touchend="null"
      >
        {{ item.label }}
      </button>
    </div>
  </div>
</template>
<script setup lang="ts">
interface Option {
  id: string
  label: string
  disabled?: boolean
}

interface Props {
  modelValue: string | null
  options: Option[]
  placeholder?: string
}

interface Emits {
  (e: 'update:modelValue', value: string): void
}

const props = defineProps<Props>()
defineEmits<Emits>()

const selected = computed(() => props.options.find((v) => v.id === props.modelValue))

const isPresent = ref(false)

const clickOutsideHandler = () => {
  isPresent.value = false
}

onMounted(() => {
  document.body.addEventListener('click', clickOutsideHandler)
})

onUnmounted(() => {
  document.body.removeEventListener('click', clickOutsideHandler)
})
</script>
<style lang="scss" scoped>
@import '~~/components/partials/token.scss';
@import '~~/components/partials/utils.scss';

.menu {
  position: relative;
}

.button {
  display: grid;
  grid: auto / auto auto;
  gap: 4px;
  align-items: center;
  color: $text1;
  font-size: $typography-s;
}

.select {
  @include round-corner;
  @include background-blur;
  position: absolute;
  background-color: $surface2;
  display: grid;
  padding: 0 4px;
  height: 32px;
  grid: auto / auto-flow;
  gap: 1px;
  bottom: 120%;
  right: -12px;
}

.option {
  @include reset-button;
  @include clickable;
  font-size: $typography-s;
  color: $text4;
  padding: 0 8px;
  white-space: nowrap;
  position: relative;

  &.active {
    font-weight: bold;
  }

  & + & {
    &::before {
      content: '';
      display: block;
      position: absolute;
      left: -1px;
      top: 50%;
      height: 60%;
      transform: translateY(-50%);
      border-left: solid 1px $surface2-stroke;
    }
  }
}
</style>
