<template>
  <div>
    <h1>譜面を追加する</h1>
    <div class="section">
      <div class="label">曲名</div>
      <TextField v-model="name"></TextField>
    </div>
    <!-- <button :disabled="fetching" @click="submit">追加</button> -->
  </div>
</template>
<script setup lang="ts">
// import { useMutation } from '@urql/vue'
// import { CreateIdolDocument } from '~~/generated/graphql'

// const { push } = useRouter()
const name = ref('')
// const { executeMutation, fetching } = useMutation(CreateIdolDocument)
// const submit = async () => {
//   await executeMutation({ object: { name: name.value } })
//   name.value = ''
//   push('/idol')
// }
</script>
<style lang="scss" scoped>
.section {
  display: grid;
  grid: auto-flow / auto;
  gap: 8px;
  padding: 0 24px;
}
.label {
  font-size: 12px;
}
</style>
