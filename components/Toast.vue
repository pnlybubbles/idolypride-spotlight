<template>
  <transition name="fade">
    <div v-if="show" class="toast" :class="[variant]">
      <font-awesome-icon v-if="variant === 'error'" icon="circle-exclamation" class="icon"></font-awesome-icon>
      <font-awesome-icon v-if="variant === 'info'" icon="circle-check" class="icon"></font-awesome-icon>
      <div class="container">
        <div class="title">{{ title }}</div>
        <div v-if="message" class="message">{{ message }}</div>
      </div>
      <button class="dismiss" @click="handleDismiss" @touchend="null">
        <font-awesome-icon icon="circle-xmark"></font-awesome-icon>
      </button>
    </div>
  </transition>
</template>
<script setup lang="ts">
import { ToastVariant } from '~~/composable/toast'

interface Props {
  title: string
  message: string | undefined
  variant: ToastVariant
  show: boolean | null
}
defineProps<Props>()
interface Emits {
  (e: 'update:show', value: Props['show']): void
}
const emit = defineEmits<Emits>()

onMounted(() => {
  emit('update:show', true)
})

const handleDismiss = () => {
  emit('update:show', false)
}
</script>
<style lang="scss" scoped>
@import '~~/components/partials/token.scss';
@import '~~/components/partials/utils.scss';

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
  @include clickable;
  @include reset-button;

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

.fade-enter-active,
.fade-leave-active {
  transition: all 0.32s;
}
.fade-enter-from {
  opacity: 0;
  transform: translateY(-160px);
}
.fade-leave-to {
  opacity: 0;
}
</style>
