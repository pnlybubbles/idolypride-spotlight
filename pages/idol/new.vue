<template>
  <Layout>
    <template #heading>アイドルを追加する</template>
    <VStack :spacing="16">
      <Section>
        <template #label>名前</template>
        <Listbox v-model="name" :options="nameOptions" required></Listbox>
      </Section>
      <Section>
        <template #label>カード名</template>
        <TextField v-model="title" placeholder="夢の共演" required></TextField>
      </Section>
      <Section>
        <template #label>属性</template>
        <HStack :spacing="8">
          <Listbox v-model="type" :options="typeOptions" required></Listbox>
          <Listbox v-model="role" :options="roleOptions" required></Listbox>
        </HStack>
      </Section>
      <div v-for="i in SKILLS" :key="i">
        <div class="sub-heading">スキル{{ i + 1 }}</div>
        <VStack :spacing="16">
          <Section>
            <template #label>スキル名</template>
            <TextField v-model="skill[i].label" :placeholder="SKILLS_NAME_PLACEHOLDER[i]" required></TextField>
          </Section>
          <Section>
            <template #label>スキルタイプ</template>
            <Listbox v-model="skill[i].type" :options="skillTypeOptions" required></Listbox>
          </Section>
          <Section>
            <template #label>CT</template>
            <div class="ct">
              <TextField
                v-model="skill[i].ct"
                :placeholder="SKILLS_CT_PLACEHOLDER[i]"
                :disabled="skill[i].type === 'sp' || skill[i].once"
                required
              ></TextField>
              <Check v-model="skill[i].once">ライブ中1回</Check>
            </div>
          </Section>
        </VStack>
      </div>
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
import { IdolRole, IdolType, SkillType } from '~~/utils/types'

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
].map((id) => ({ id, label: id }))
const title = ref('')
const type = ref<IdolType>('vocal')
const typeOptions: { id: IdolType; label: string }[] = [
  { id: 'vocal', label: 'ボーカル' },
  { id: 'dance', label: 'ダンス' },
  { id: 'visual', label: 'ビジュアル' },
]
const role = ref<IdolRole>('scorer')
const roleOptions: { id: IdolRole; label: string }[] = [
  { id: 'scorer', label: 'スコアラー' },
  { id: 'buffer', label: 'バッファー' },
  { id: 'supporter', label: 'サポーター' },
]
const SKILLS = [0, 1, 2] as const
const SKILLS_NAME_PLACEHOLDER = ['太陽の光と共に', '大好きなあのキャラ', '人生の倍返し'] as const
const SKILLS_CT_PLACEHOLDER = ['', '30', ''] as const
const skill = reactive([
  { label: '', type: 'sp', ct: '', once: false },
  { label: '', type: 'a', ct: '', once: false },
  { label: '', type: 'p', ct: '', once: true },
] as const)
const skillTypeOptions: { id: SkillType; label: string }[] = [
  { id: 'sp', label: 'SPスキル' },
  { id: 'a', label: 'Aスキル' },
  { id: 'p', label: 'Pスキル' },
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
<style lang="scss" scoped>
@import '~~/components/partials/token.scss';

.sub-heading {
  @include align;
  color: $text1;
  font-size: $typography-l;
  font-weight: bold;
  margin-top: 16px;
  margin-bottom: 16px;
}

.ct {
  display: grid;
  grid: auto / 1fr auto;
  gap: 8px;
}
</style>
