<template>
  <TextField v-model="value" placeholder="夢の共演" required :error="alreadyExist">
    <template #error>既に存在しています</template>
  </TextField>
</template>
<script setup lang="ts">
import { useQuery } from '@urql/vue'
import { useAuth } from '~~/composable/auth0'
import { useError } from '~~/composable/error'
import { GetIdolListDocument } from '~~/generated/graphql'
import { deserializeIdolList } from '~~/utils/formatter'

interface Props {
  modelValue: string
  editingIdolId: string | null
}
const props = defineProps<Props>()

interface Emits {
  (e: 'update:modelValue', value: string): void
}
const emit = defineEmits<Emits>()

const value = computed({
  get: () => props.modelValue,
  set: (v) => emit('update:modelValue', v),
})

const { notAuthenticated } = useAuth()
const { data, error } = useQuery({ query: GetIdolListDocument, pause: notAuthenticated })
useError(error)

const idolList = computed(() => (data.value ? deserializeIdolList(data.value) : []))
const alreadyExist = computed(() =>
  idolList.value
    .filter((v) => props.editingIdolId === null || v.id !== props.editingIdolId)
    .map((v) => v.title)
    .includes(props.modelValue.trim())
)
</script>
