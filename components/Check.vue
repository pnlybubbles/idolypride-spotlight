<template>
  <div class="check" :class="{ checked: modelValue }">
    <input
      type="checkbox"
      :checked="modelValue"
      @input="$emit('update:modelValue', ($event.target as any).checked)"
      @touchend="null"
    />
    <div class="box">
      <font-awesome-icon class="icon" icon="check"></font-awesome-icon>
    </div>
    <div class="label"><slot></slot></div>
  </div>
</template>
<script setup lang="ts">
interface Props {
  modelValue: boolean
}
defineProps<Props>()
interface Emits {
  (e: 'update:modelValue', value: boolean): void
}
defineEmits<Emits>()
</script>
<style lang="scss" scoped>
@import '~~/components/partials/token.scss';
@import '~~/components/partials/utils.scss';

.check {
  @include clickable;
  @include round-corner;
  background-color: $surface1;
  padding: 0 16px 0 12px;
  height: 40px;
  font-size: 16px;
  color: $text1;
  border: solid 1px transparent;
  position: relative;
  z-index: 0;
  display: grid;
  align-items: center;
  grid: auto / auto auto;
  gap: 8px;
}

input {
  position: absolute;
  z-index: 1;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  appearance: none;
  outline: none;
  opacity: 0;
  margin: 0;
}

.box {
  @include round-corner;
  height: 20px;
  width: 20px;
  border: solid 1px $text3;
  display: grid;
  align-items: center;
  justify-items: center;
}

.checked .box {
  border-color: $text1;
  background-color: $text1;
}

.icon {
  color: #000;
  opacity: 0;
}

.checked .icon {
  opacity: 1;
}

.label {
  color: $text1;
  font-size: 16px;
}
</style>
