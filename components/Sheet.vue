<template>
  <teleport v-if="present" to="body">
    <div class="sheet" @click.self="$emit('update:present', false)">
      <div class="content">
        <slot></slot>
      </div>
    </div>
  </teleport>
</template>
<script setup lang="ts">
interface Props {
  present: boolean
}
interface Emits {
  (e: 'update:present', value: boolean): void
}
defineProps<Props>()
defineEmits<Emits>()
</script>
<style lang="scss" scoped>
.sheet {
  position: fixed;
  top: 0;
  bottom: 0;
  height: 100vh;
  width: 100vw;
  background-color: rgba(#fff, 0.1);
}
.content {
  position: absolute;
  left: 0;
  bottom: 0;
  width: 100%;
  background-color: #000;
  border-radius: 24px 24px 0 0;
  padding-top: 24px;
  padding-bottom: 40px;
}
</style>
