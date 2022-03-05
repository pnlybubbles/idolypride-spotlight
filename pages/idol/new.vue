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
        <div class="sub-heading">
          <div>スキル{{ i + 1 }}</div>
          <div></div>
          <div class="level-label">Level</div>
          <div class="level-toggle">
            <button
              v-for="level in SKILL_LEVEL_MAX[i]"
              :key="level"
              class="level-toggle-item"
              :class="{ active: level === skillLevelToggle[i] }"
              @click="skillLevelToggle[i] = level"
              @touchend="null"
            >
              {{ level }}
            </button>
          </div>
        </div>
        <VStack :spacing="16">
          <Section>
            <template #label>スキル名</template>
            <TextField v-model="skill[i].label" :placeholder="SKILLS_NAME_PLACEHOLDER[i]" required></TextField>
          </Section>
          <Section>
            <template #label>スキルタイプ</template>
            <Listbox
              v-model="skill[i].type"
              :options="i === 0 ? skillTypeOptions1 : skillTypeOptions23"
              required
            ></Listbox>
          </Section>
          <Section v-if="skill[i].type !== 'sp'">
            <template #label>CT</template>
            <HStack :spacing="8">
              <TextField
                :model-value="skill[i].once ? 'なし' : skill[i].ct"
                :placeholder="SKILLS_CT_PLACEHOLDER[i]"
                :disabled="skill[i].once"
                required
                @update:model-value="skill[i].ct = $event"
              ></TextField>
              <Check v-model="skill[i].once">ライブ中1回</Check>
            </HStack>
          </Section>
          <Section>
            <template #label>効果</template>
            <div v-for="(ability, j) in skill[i].ability" :key="j" class="ability">
              <Section :gutter="8">
                <template #label>種別</template>
                <Listbox v-model="ability.type" :options="abilityTypeOptions"></Listbox>
              </Section>
              <Section v-if="ability.type === 'buff' || ability.type === 'action-buff'" :gutter="8">
                <template #label>詳細</template>
                <Listbox v-model="ability.target" placeholder="対象" :options="buffTargetOptions" required></Listbox>
                <Listbox
                  v-model="ability.buff"
                  placeholder="バフの種類"
                  :options="ability.type === 'buff' ? buffTypeOptions : actionBuffTypeOptions"
                  required
                ></Listbox>
                <HStack :spacing="4">
                  <TextField
                    v-model="ability.amount"
                    :placeholder="deriveUnitByBuffType(ability.buff)"
                    :disabled="deriveDisabledAmount(ability.buff)"
                    required
                  ></TextField>
                  <TextField
                    v-if="ability.type === 'buff'"
                    v-model="ability.span"
                    placeholder="持続ビート数"
                    required
                  ></TextField>
                </HStack>
              </Section>
              <Section v-else-if="ability.type === 'score'" :gutter="8">
                <template #label>スコア</template>
                <TextField v-model="ability.amount" placeholder="1000" required></TextField>
              </Section>
            </div>
            <button class="new-ability" @click="handleAddAbility(i)" @touchend="null">
              <font-awesome-icon icon="circle-plus"></font-awesome-icon>
              <div>効果を追加する</div>
            </button>
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
import { AbilityType, ActionBuffType, BuffTarget, BuffType, IdolRole, IdolType, SkillType } from '~~/utils/types'

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

interface AbilityInput {
  type: AbilityType
  buff: BuffType | ActionBuffType | null
  target: BuffTarget | null
  amount: string
  span: string
}
interface SkillInput {
  label: string
  type: SkillType
  ct: string
  once: boolean
  ability: AbilityInput[]
}

const skill = reactive([
  { label: '', type: 'sp', ct: '', once: false, ability: [] },
  { label: '', type: 'a', ct: '', once: false, ability: [] },
  { label: '', type: 'p', ct: '', once: true, ability: [] },
] as [SkillInput, SkillInput, SkillInput])

const handleAddAbility = (index: typeof SKILLS[number]) => {
  skill[index].ability.push({ type: 'buff', buff: null, target: null, amount: '', span: '' })
}

const skillTypeOptions1: { id: SkillType; label: string }[] = [
  { id: 'sp', label: 'SPスキル' },
  { id: 'a', label: 'Aスキル' },
]
const skillTypeOptions23: { id: SkillType; label: string }[] = [
  { id: 'a', label: 'Aスキル' },
  { id: 'p', label: 'Pスキル' },
]
const SKILL_LEVEL_MAX = [6, 5, 4] as const
const skillLevelToggle = reactive([1, 1, 1] as [number, number, number])
const abilityTypeOptions: { id: AbilityType; label: string }[] = [
  { id: 'buff', label: '持続効果' },
  { id: 'action-buff', label: '即時効果' },
  { id: 'score', label: 'スコア獲得' },
]
const buffTypeOptions: { id: BuffType; label: string }[] = [
  { id: 'vocal', label: 'ボーカル上昇' },
  { id: 'dance', label: 'ダンス上昇' },
  { id: 'visual', label: 'ビジュアル上昇' },
  { id: 'score', label: 'スコア上昇' },
  { id: 'a-score', label: 'Aスキルスコア上昇' },
  { id: 'sp-score', label: 'SPスキルスコア上昇' },
  { id: 'beat-score', label: 'ビートスコア上昇' },
  { id: 'buff-amount', label: '強化効果増強' },
  { id: 'cmb-continuous', label: 'コンボ継続' },
  { id: 'cmb-score', label: 'コンボスコア上昇' },
  { id: 'critical-rate', label: 'クリティカル率上昇' },
  { id: 'critical-score', label: 'クリティカル係数上昇' },
  { id: 'stamina-exhaust', label: 'スタミナ消費増加' },
  { id: 'stamina-saving', label: 'スタミナ消費低下' },
  { id: 'steruss', label: 'ステルス' },
]
const actionBuffTypeOptions: { id: ActionBuffType; label: string }[] = [
  { id: 'buff-span', label: '強化効果延長' },
  { id: 'ct-reduction', label: 'CT減少' },
  { id: 'stamina-recovery', label: 'スタミナ回復' },
]

const deriveUnitByBuffType = (type: BuffType | ActionBuffType | null): string => {
  switch (type) {
    case 'buff-span':
      return 'ビート延長数'
    case 'ct-reduction':
      return 'CT減少数'
    case 'stamina-recovery':
      return 'スタミナ回復量'
    default:
      return '段階'
  }
}
const deriveDisabledAmount = (type: BuffType | ActionBuffType | null): boolean => type === 'cmb-continuous'

const buffTargetOptions: { id: BuffTarget; label: string }[] = [
  { id: 'self', label: '自身' },
  { id: 'all', label: '全員' },
  { id: 'center', label: 'センター' },
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
@import '~~/components/partials/utils.scss';

.sub-heading {
  @include align;
  color: $text1;
  font-size: $typography-l;
  font-weight: bold;
  margin-top: 16px;
  margin-bottom: 16px;
  display: grid;
  grid: auto / auto 1fr auto auto;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.level-label {
  font-size: $typography-s;
  font-weight: normal;
  color: $text3;
}

.level-toggle {
  display: grid;
  grid: auto / auto-flow min-content;
  gap: 4px;
}

.level-toggle-item {
  @include round-corner;
  @include clickable;
  @include reset-button;

  font-size: $typography-m;
  font-weight: normal;
  font-family: Arial;
  color: $text3;
  height: 28px;
  width: 28px;
  display: grid;
  justify-items: center;
  align-items: center;
  border: solid 1px $text3;

  &.active {
    color: $background1;
    background-color: $text1;
    border-color: $text1;
  }
}

.ability {
  @include round-corner;
  border: solid 1px $surface1;
  padding: 8px 0;
  display: grid;
  grid: auto-flow / auto;
  gap: 16px;
}

.new-ability {
  @include reset-button;
  @include round-corner;
  border: solid 1px $surface1;
  font-size: $typography-s;
  color: $text3;
  display: grid;
  grid: auto / auto auto;
  gap: 4px;
  align-items: center;
  justify-content: center;
  padding: 12px 0;
}
</style>
