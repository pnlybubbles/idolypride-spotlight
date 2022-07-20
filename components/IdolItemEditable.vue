<template>
  <IdolItem :idol="idol" @click="present = true"></IdolItem>
  <Sheet v-model:present="present">
    <VStack :spacing="16">
      <IdolItem v-model:skill-levels="selectedLevels" :idol="idol" variant="big" no-event></IdolItem>
      <Section>
        <Check v-model="isOwned" @update:model-value="mutate">
          <with-symbol>
            加入している
            <template #symbol><OwnSettingBadge></OwnSettingBadge></template>
          </with-symbol>
        </Check>
        <Button :disabled="disableUpdateSkillLevels" variant="secondary" @click="updateSkillLevels">
          <with-symbol>
            {{ skillLevelsApplying ? 'スキルレベルを保存中...' : 'スキルレベルを保存する' }}
            <template #symbol><OwnSettingBadge></OwnSettingBadge></template>
          </with-symbol>
        </Button>
        <ButtonLink :to="`/idol/${idol.id}/edit`" :disabled="!canEdit">アイドルを編集する</ButtonLink>
        <NoteText v-if="!canEdit">自分の追加したアイドルのみ編集できます</NoteText>
        <NoteText v-if="isAdmin">管理者権限によりすべてのアイドルを編集できます</NoteText>
      </Section>
    </VStack>
  </Sheet>
</template>
<script setup lang="ts">
import { useMutation } from '@urql/vue'
import { useAuth } from '~~/composable/auth0'
import { useError } from '~~/composable/error'
import { useDebounce } from '~~/composable/atom'
import { AddOwnedIdolDocument, RemoveOwnedIdolDocument } from '~~/generated/graphql'
import { IdolData } from '~~/utils/types'
import { pickSkillsByLevel } from '~~/utils/formatter'
import { mapArrayN } from '~~/utils'

interface Props {
  idol: IdolData
  isAdmin: boolean
}
const props = defineProps<Props>()

const { user } = useAuth()

const present = ref(false)

const isManaged = computed(() => {
  const idolOwner = props.idol.userId
  return idolOwner != null && user.value?.sub != null && idolOwner == user.value.sub
})

const canEdit = computed(() => {
  return isManaged.value || props.isAdmin
})

const isOwned = ref(props.idol.owned !== null)

watchEffect(() => {
  isOwned.value = props.idol.owned !== null
})

const {
  executeMutation: executeAddMutation,
  error: errorAdding,
  fetching: updatingSkillLevels,
} = useMutation(AddOwnedIdolDocument)
useError(errorAdding)

const { executeMutation: executeRemoveMutation, error: errorRemoving } = useMutation(RemoveOwnedIdolDocument)
useError(errorRemoving)

const mutate = useDebounce(isOwned.value, 500, async (value) => {
  if (props.idol.owned === undefined) {
    return
  }
  if (value) {
    await executeAddMutation({ idol_id: props.idol.id })
  } else {
    await executeRemoveMutation({ idol_id: props.idol.id })
  }
})

const maxSkillLevels = mapArrayN(pickSkillsByLevel(props.idol.skills), (v) => v.level)
// propsから直でrefに流すと参照が同一で書き換わってしまうので、値としてコピーする
const selectedLevels = ref(mapArrayN(props.idol.owned?.skillLevels ?? maxSkillLevels, (v) => v))

const updateSkillLevels = async () => {
  skillLevelsApplying.value = true
  await executeAddMutation({ idol_id: props.idol.id, skill_levels: selectedLevels.value })
}

const skillLevelsUpToDate = computed(
  () =>
    // 加入していない場合は変更点はなし
    props.idol.owned === null ||
    // 未設定は変更点あり
    (props.idol.owned.skillLevels !== null &&
      mapArrayN(props.idol.owned.skillLevels, (v, i) => selectedLevels.value[i] === v).every((v) => v))
)
const disableUpdateSkillLevels = computed(
  () => updatingSkillLevels.value || skillLevelsApplying.value || skillLevelsUpToDate.value
)

const skillLevelsApplying = ref(false)
watchEffect(() => {
  if (skillLevelsUpToDate.value) {
    skillLevelsApplying.value = false
  }
})
</script>
