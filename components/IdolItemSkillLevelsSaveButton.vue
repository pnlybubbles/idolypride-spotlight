<template>
  <Button :disabled="disableUpdateSkillLevels" variant="secondary" @click="updateSkillLevels">
    <with-symbol>
      {{ skillLevelsApplying ? 'スキルレベルを保存中...' : 'スキルレベルを保存する' }}
      <template #symbol><OwnSettingBadge></OwnSettingBadge></template>
    </with-symbol>
  </Button>
</template>
<script setup lang="ts">
import { useMutation } from '@urql/vue'
import { AddOwnedIdolDocument } from '~~/generated/graphql'
import { ArrayN, mapArrayN } from '~~/utils'
import { IdolData } from '~~/utils/types'
import { useError } from '~~/composable/error'

interface Props {
  idol: IdolData
  skillLevels: ArrayN<number, 3> | null
}

const props = defineProps<Props>()

const {
  executeMutation: executeAddMutation,
  error: errorAdding,
  fetching: updatingSkillLevels,
} = useMutation(AddOwnedIdolDocument)
useError(errorAdding)

const updateSkillLevels = async () => {
  skillLevelsApplying.value = true
  await executeAddMutation({ idol_id: props.idol.id, skill_levels: props.skillLevels })
}

const skillLevelsUpToDate = (idol: IdolData, levels: ArrayN<number, 3>) =>
  // 加入していない場合は変更点はなし
  idol.owned === null ||
  // 未設定は変更点あり
  (idol.owned.skillLevels !== null && mapArrayN(idol.owned.skillLevels, (v, i) => levels[i] === v).every((v) => v))

const disableUpdateSkillLevels = computed(
  () =>
    updatingSkillLevels.value ||
    skillLevelsApplying.value ||
    props.skillLevels === null ||
    skillLevelsUpToDate(props.idol, props.skillLevels)
)

const skillLevelsApplying = ref(false)
watchEffect(() => {
  if (props.skillLevels === null) {
    return
  }
  if (skillLevelsUpToDate(props.idol, props.skillLevels)) {
    skillLevelsApplying.value = false
  }
})
</script>
