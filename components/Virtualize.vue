<template>
  <div ref="el" :style="render ? {} : { height: `${cachedHeight}px` }">
    <slot v-if="render"></slot>
  </div>
</template>
<script setup lang="ts">
const el = ref<HTMLDivElement | null>(null)
const render = ref(false)
const cachedHeight = ref(0)

let observer: IntersectionObserver | null = null

onMounted(() => {
  if (el.value === null) {
    return
  }
  observer = new IntersectionObserver((entries) => {
    if (el.value === null) {
      return
    }
    for (const entry of entries) {
      if (entry.isIntersecting) {
        render.value = true
      } else {
        cachedHeight.value = entry.boundingClientRect.height
        render.value = false
      }
    }
  })
  observer.observe(el.value)
})

onBeforeUnmount(() => {
  if (observer === null) {
    return
  }
  observer.disconnect()
})
</script>
