<template>
  <Shell>
    <template #heading>譜面を追加する</template>
    <Section>
      <template #label>曲名</template>
      <TextField v-model="name"></TextField>
    </Section>
    <!-- <button :disabled="fetching" @click="submit">追加</button> -->
  </Shell>
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
<style lang="scss" scoped></style>
