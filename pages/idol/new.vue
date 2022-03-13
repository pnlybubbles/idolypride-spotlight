<template>
  <Layout>
    <template #heading>アイドルを追加する</template>
    <IdolForm :disabled="invalid || fetching" submit-label="追加" @submit="submit"></IdolForm>
    <Loading :busy="fetching">追加しています...</Loading>
  </Layout>
</template>
<script setup lang="ts">
import { useMutation } from '@urql/vue'
import { useRouteGuard } from '~~/composable/route'
import { CreateIdolDocument } from '~~/generated/graphql'
import { DEFAULT_META } from '~~/utils/meta'
import { useForm } from '~~/composable/form'
import { serializeIdol } from '~~/utils/formatter'
import { useBeforeUnload } from '~~/composable/atom'
import { IdolData } from '~~/utils/types'
import { useError } from '~~/composable/error'

const router = useRouter()

const { invalid } = useForm()
const { executeMutation, fetching, error } = useMutation(CreateIdolDocument)
useError(error)

const submit = async (data: IdolData) => {
  const { error } = await executeMutation({
    object: serializeIdol(data),
  })

  if (error) {
    return
  }

  skipUnloadConfirm()
  void router.push('/idol')
}

const skipUnloadConfirm = useBeforeUnload(() => confirm('ページを離れる場合は編集内容が破棄されます。よろしいですか？'))

useRouteGuard()
useMeta(DEFAULT_META)
</script>
<style lang="scss" scoped></style>
