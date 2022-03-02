<template>
  <Layout>
    <template #heading>アイドルを追加する</template>
    <VStack :spacing="16">
      <Section>
        <template #label>名前</template>
        <Listbox v-model="name" :options="nameOptions" required></Listbox>
      </Section>
      <Section>
        <Button :disabled="fetching" @click="submit">追加</Button>
      </Section>
    </VStack>
  </Layout>
</template>
<script setup lang="ts">
import { useMutation } from '@urql/vue'
import { useRouteGuard } from '~~/composable/route'
import { CreateIdolDocument } from '~~/generated/graphql'
import { DEFAULT_META } from '~~/utils/meta'
import Listbox from '~~/components/Listbox.vue'

const router = useRouter()
const name = ref(null)
const nameOptions = [
  '長瀬琴乃',
  '伊吹渚',
  '白石沙季',
  '成宮すず',
  '早坂芽衣',
  '川咲さくら',
  '兵藤雫',
  '白石千紗',
  '一ノ瀬怜',
  '佐伯遙子',
  '天動瑠依',
  '鈴村優',
  '奥山すみれ',
  '神崎莉央',
  '井川葵',
  '小美山愛',
  '赤崎こころ',
  '長瀬麻奈',
]
const { executeMutation, fetching } = useMutation(CreateIdolDocument)
const submit = async () => {
  await executeMutation({ object: { name: name.value } })
  name.value = null
  void router.push('/idol')
}

useRouteGuard()
useMeta(DEFAULT_META)
</script>
<style lang="scss" scoped></style>
