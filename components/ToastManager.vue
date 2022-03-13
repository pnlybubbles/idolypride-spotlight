<template>
  <teleport v-if="ready && toast.length > 0" to="body">
    <div class="toast-zone">
      <template v-for="item in toast" :key="item.id">
        <Toast v-model:show="item.show" :title="item.title" :message="item.message" :variant="item.variant"></Toast>
      </template>
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
