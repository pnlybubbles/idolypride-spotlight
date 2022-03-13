<template>
  <teleport v-if="ready && toast.length > 0" to="body">
    <div class="toast-zone">
      <div v-for="item in toast" :key="item.id" class="toast" :class="[item.variant]">
        <font-awesome-icon v-if="item.variant === 'error'" icon="circle-exclamation" class="icon"></font-awesome-icon>
        <font-awesome-icon v-if="item.variant === 'info'" icon="circle-check" class="icon"></font-awesome-icon>
        <div class="container">
          <div class="title">{{ item.title }}</div>
          <div v-if="item.message" class="message">{{ item.message }}</div>
        </div>
        <div class="dismiss" @click="handleDismiss(item.id)" @touchend="null">
          <font-awesome-icon icon="circle-xmark"></font-awesome-icon>
        </div>
      </div>
    </div>
  </teleport>
</template>
<script setup lang="ts">
import { useToastDescriptor } from '~~/composable/toast'

const toast = useToastDescriptor()

const ready = ref(false)
onMounted(() => {
  ready.value = true
})

const handleDismiss = (id: number) => {
  const index = toast.findIndex((v) => v.id === id)
  toast.splice(index, 1)
}
</script>
<style lang="scss" scoped>
@import '~~/components/partials/token.scss';

.toast-zone {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  padding: 16px;
  display: grid;
  gap: 8px;
}

.toast {
  @include round-corner('L');
  @include bloom(black);

  background-color: $background1;
  padding: 16px;
  display: grid;
  grid: auto / auto 1fr;
  gap: 12px;
  align-items: center;
  position: relative;

  &.error {
    border: 2px solid $error;
  }

  &.info {
    border: 2px solid $info;
  }
}

.dismiss {
  position: absolute;
  top: 4px;
  right: 4px;
  width: 24px;
  height: 24px;
  font-size: 16px;
  display: grid;
  align-items: center;
  justify-items: center;
  color: $text3;
}

.icon {
  align-self: flex-start;
  font-size: 24px;
}

.error .icon {
  color: $error;
}

.info .icon {
  color: $info;
}

.container {
  display: grid;
  gap: 4px;
}

.title {
  font-size: $typography-m;
  font-weight: bold;
}

.message {
  font-size: $typography-s;
  color: $text3;
}
</style>
