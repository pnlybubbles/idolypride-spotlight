<template>
  <teleport v-if="ready" to="body">
    <transition name="slide">
      <div v-if="present" class="sheet" @click.self="$emit('update:present', false)">
        <div
          class="content"
          :style="{ ...(fixed ? { height: '90%' } : {}), ...(noTopPadding ? { 'padding-top': 0 } : {}) }"
        >
          <slot></slot>
        </div>
      </div>
    </transition>
  </teleport>
</template>
<script setup lang="ts">
interface Props {
  present: boolean
  fixed?: boolean
  noTopPadding?: boolean
}
interface Emits {
  (e: 'update:present', value: boolean): void
}
const props = defineProps<Props>()
defineEmits<Emits>()

const ready = ref(false)
onMounted(() => {
  ready.value = true
})

watchEffect(() => {
  if (!ready.value) {
    return
  }
  if (props.present) {
    document.body.style.overflow = 'hidden'
  } else {
    document.body.style.overflow = ''
  }
})
</script>
<style lang="scss" scoped>
@import '~~/components/partials/token.scss';

.sheet {
  position: fixed;
  top: 0;
  bottom: 0;
  height: 100%;
  width: 100%;
  background-color: $shade;
}

.content {
  @include bloom(black);

  position: absolute;
  left: 0;
  bottom: 0;
  max-height: 90%;
  width: 100%;
  background-color: $background1;
  border-radius: 24px 24px 0 0;
  overflow: hidden;
  overflow-y: auto;
  padding-top: 24px;
  padding-bottom: 40px;
}

.slide-enter-active,
.slide-leave-active {
  transition: background-color 0.32s;
  & .content {
    transition: transform 0.32s;
  }
}
.slide-enter-from,
.slide-leave-to {
  background-color: rgba($shade, 0);
  & .content {
    transform: translateY(100%);
  }
}
</style>
