<template>
  <teleport v-if="ready && busy" to="body">
    <div class="overlay">
      <div class="centering">
        <Spinner></Spinner>
        <div class="message"><slot></slot></div>
      </div>
    </div>
  </teleport>
</template>
<script setup lang="ts">
interface Props {
  busy: boolean
}
const props = defineProps<Props>()
const ready = ref(false)

onMounted(() => {
  ready.value = true
})

watchEffect(() => {
  if (!ready.value) {
    return
  }
  if (props.busy) {
    document.body.style.overflow = 'hidden'
  } else {
    document.body.style.overflow = ''
  }
})
</script>
<style lang="scss" scoped>
@import './token.scss';

.overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  display: grid;
  align-items: center;
  justify-items: center;
  background-color: $shade;
}

.centering {
  display: grid;
  grid: auto auto / auto;
  justify-items: center;
  gap: 8px;
}

.message {
  font-size: 12px;
  font-weight: bold;
  color: $text2;
}
</style>
