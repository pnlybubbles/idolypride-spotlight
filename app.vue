<template>
  <div>
    <NuxtPage />
  </div>
</template>
<script setup lang="ts">
import { provideUID } from './composable/atom'

provideUID()
</script>
