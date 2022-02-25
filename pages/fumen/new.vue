<template>
  <Shell>
    <template #heading>譜面を追加する</template>
    <VStack :spacing="16">
      <Section>
        <template #label>タイトル</template>
        <TextField v-model="name"></TextField>
      </Section>
      <Section>
        <template #label>ビート数</template>
        <TextField v-model="beat"></TextField>
      </Section>
    </VStack>
    <!-- <button :disabled="fetching" @click="submit">追加</button> -->
  </Shell>
</template>
<script setup lang="ts">
// import { useMutation } from '@urql/vue'
// import { CreateIdolDocument } from '~~/generated/graphql'

// const { push } = useRouter()
const name = ref('')
const beat = ref('')
// const { executeMutation, fetching } = useMutation(CreateIdolDocument)
// const submit = async () => {
//   await executeMutation({ object: { name: name.value } })
//   name.value = ''
//   push('/idol')
// }
</script>
<style lang="scss" scoped></style>
