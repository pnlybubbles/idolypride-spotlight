<template>
  <div class="sheet">
    <LiveGuide class="lane guide-lane" :max-beat="beat"></LiveGuide>
    <div v-for="i in LANES" :key="i" class="lane live-lane">
      <template v-for="item in lanes[i]" :key="item.id">
        <LiveSkill
          v-if="item.type === 'sp' || item.type === 'a' || item.type === 'p'"
          :variant="item.type"
          v-bind="item"
          :skill="getSkill(i, item.index)"
          :lane="i"
        ></LiveSkill>
        <LiveBuff
          v-else-if="item.type === 'buff'"
          :beat="item.beat"
          :buff="item.buff"
          :affected="item.affected"
          :span="item.span"
          :shift="item.shift"
        ></LiveBuff>
      </template>
    </div>
  </div>
</template>
<script setup lang="ts">
import { isType, simulate } from './simulate'
import { ArrayN } from '~~/utils'
import { AbilityType, BuffAbilityType, IdolData, Lane, LiveData, SkillIndex, LaneData } from '~~/utils/types'
import { LANES, px } from '~~/utils/common'
import { useFumenScaleFactor } from '~~/composable/localstorage-descriptors'
import cloneDeep from 'clone-deep'
import { pickSkillsByLevel } from '~~/utils/formatter'

interface Props {
  live: LiveData
  lane: LaneData
  idols: ArrayN<IdolData | null, 5>
}

const props = defineProps<Props>()

const [scaleFactor] = useFumenScaleFactor()
const beat = computed(() => props.live.beat)

const getSkill = (lane: Lane, skillIndex: SkillIndex | undefined) => {
  const idol = props.idols[lane]
  if (!idol) {
    return undefined
  }
  return pickSkillsByLevel(idol.skills, idol.owned?.skillLevels ?? undefined).find((v) => v.index === skillIndex)
}

// immerのProxyと干渉するので生objectに戻す
// toRawではネストが深くて戻しきれないのでcloneDeepで無理やり再帰的に戻す
const simulated = computed(() => simulate(props.live, cloneDeep(props.idols)))

type Item = {
  id: string
  beat: number
  buff: AbilityType
} & (
  | {
      type: 'sp' | 'a'
      index: SkillIndex | undefined
      fail: boolean
      activated: { type: BuffAbilityType; amount: number }[]
    }
  | {
      type: 'p'
      index: SkillIndex
    }
  | {
      type: 'buff'
      affected: boolean
      span: number
      shift: number
    }
)

const lanes = computed(() =>
  LANES.map((lane) =>
    simulated.value.result
      .filter((v) => v.lane === lane)
      .sort((a, b) => a.beat - b.beat)
      .reduce((acc, c) => {
        if (c.type !== 'buff') {
          // アイドルが未選択の場合はシミュレート結果のスキル失敗を打ち消す
          return [...acc, props.idols[lane] == null ? { ...c, fail: false } : c]
        }
        const occupiedShift = acc
          .filter(isType('buff'))
          .filter((v) => v.beat + v.span >= c.beat)
          .map((v) => v.shift)
        const availableShift = new Array(occupiedShift.reduce((p, c) => Math.max(p, c), 0) + 2)
          .fill(null)
          .map((_, i) => i)
          .filter((v) => !occupiedShift.includes(v))
        const shift = availableShift[0] ?? 0
        return [
          ...acc,
          {
            ...c,
            shift,
          },
        ]
      }, [] as Item[])
  )
)

const height = computed(() => px(beat.value * scaleFactor.value))
</script>
<style lang="scss" scoped>
@import '~~/components/partials/token.scss';

.sheet {
  @include lane-grid;
  height: v-bind(height);
  user-select: none;
  position: relative;
  z-index: 0;
}

.lane + .lane {
  border-left: 1px solid rgba(white, 0.1);
}

.live-lane {
  position: relative;
}

.guide-lane {
  z-index: 1;
}
</style>
