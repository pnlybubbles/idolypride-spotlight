<template>
  <Layout>
    <template #heading>アイドル</template>
    <div class="main">
      <div class="warn">
        <Callout>
          <template #title>工事中</template>
          アイドルとスキルを一覧してソートしたりフィルタしたりできるページになる予定。
        </Callout>
      </div>
      <div v-if="fetching" class="loading"><Spinner></Spinner></div>
      <ul v-else class="list">
        <li v-for="idol in idolList" :key="idol.id" class="item">
          <div class="heading">
            <div class="type" :class="idol.type">
              <RoleIcon :role="idol.role" class="role"></RoleIcon>
            </div>
            <div>
              <span class="title">{{ idol.title }}</span>
              <span class="name">{{ idol.name }}</span>
            </div>
          </div>
          <div class="status">
            <div class="skill-overview">
              <div v-for="skill in idol.skills" :key="skill.id" class="skill-tag">
                <div class="skill-type">{{ skill.type.toUpperCase() }}</div>
                <div v-if="skill.type !== 'sp'" class="skill-ct">{{ skill.ct === 0 ? '-' : skill.ct }}</div>
              </div>
            </div>
            <div class="skill-list">
              <div v-for="skill in idol.skills" :key="skill.id" class="skill-item">
                <div v-if="skill.type === 'p'" class="ability">
                  <font-awesome-icon icon="flag"></font-awesome-icon>
                  <div>{{ skill.trigger.type }}</div>
                </div>
                <div v-for="ability in skill.ability" :key="ability.id" class="ability">
                  <template v-if="ability.div === 'score'">
                    <RoleIcon role="scorer"></RoleIcon>
                    <div>{{ ability.amount }}%</div>
                  </template>
                  <template v-if="ability.div === 'buff'">
                    <RoleIcon role="buffer"></RoleIcon>
                    <div>{{ ability.amount }}</div>
                    <div>{{ ability.type }}</div>
                    <div>{{ ability.target }}</div>
                    <div v-if="ability.condition">
                      ({{ ability.condition.type
                      }}{{ 'amount' in ability.condition ? ` ${ability.condition.amount}` : '' }})
                    </div>
                    <div>[{{ ability.span }}]</div>
                  </template>
                  <template v-if="ability.div === 'action-buff'">
                    <RoleIcon role="buffer"></RoleIcon>
                    <div>{{ ability.amount }}</div>
                    <div>{{ ability.type }}</div>
                    <div>{{ ability.target }}</div>
                    <div v-if="ability.condition">
                      ({{ ability.condition.type
                      }}{{ 'amount' in ability.condition ? ` ${ability.condition.amount}` : '' }})
                    </div>
                  </template>
                </div>
              </div>
            </div>
          </div>
        </li>
      </ul>
      <div class="button">
        <ButtonLink to="/idol/new">アイドルを追加する</ButtonLink>
      </div>
    </div>
  </Layout>
</template>
<script setup lang="ts">
import { useQuery } from '@urql/vue'
import { GetIdolListDocument } from '~/generated/graphql'
import { useAuth } from '~~/composable/auth0'
import { useRouteGuard } from '~~/composable/route'
import { deserializeIdol } from '~~/utils/formatter'
import { DEFAULT_META } from '~~/utils/meta'
const { notAuthenticated } = useAuth()
const { data, fetching, error } = useQuery({ query: GetIdolListDocument, pause: notAuthenticated })
if (error.value) {
  console.error(error.value)
}
const idolList = computed(() => (data.value ? deserializeIdol(data.value) : []))
console.log(idolList.value)

useRouteGuard()
useMeta(DEFAULT_META)
</script>
<style lang="scss" scoped>
@import '~~/components/partials/token.scss';

.main {
  display: grid;
  grid: auto-flow / auto;
  gap: 16px;
}

.warn {
  @include align;
}

.loading {
  display: grid;
  justify-content: center;
}

.list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: grid;
  grid: auto-flow / auto;
  gap: 16px;
}

.item {
  display: grid;
  grid: auto auto / auto;
  gap: 8px;
}

.heading {
  @include align;
  display: grid;
  grid: auto / auto-flow;
  justify-content: start;
  align-items: center;
  gap: 8px;
}

.title {
  font-size: $typography-l;
  font-weight: bold;
  color: $text1;
  margin-right: 8px;
}

.name {
  font-size: $typography-s;
  color: $text3;
}

.role {
  font-size: 12px;
  color: $text1;
}

.type {
  @include round-corner;
  height: 20px;
  width: 20px;
  display: grid;
  align-items: center;
  justify-items: center;

  &.vocal {
    background-color: $vocal;
    @include bloom($vocal);
  }

  &.dance {
    background-color: $dance;
    @include bloom($dance);
  }

  &.visual {
    background-color: $visual;
    @include bloom($visual);
  }
}

.status {
  display: grid;
  grid: auto auto / auto;
  gap: 10px;
}

.skill-overview {
  @include align;
  display: grid;
  grid: auto / auto-flow;
  gap: 8px;
  justify-content: start;
}

.skill-tag {
  @include round-corner;
  background-color: $surface1;
  padding: 4px 8px;
  display: grid;
  grid: auto / auto-flow;
  gap: 4px;
}

.skill-type {
  font-size: $typography-s;
  font-weight: bold;
  color: $text1;
}

.skill-ct {
  font-size: $typography-s;
  font-weight: bold;
  color: $text3;
}

.skill-list {
  display: grid;
  grid: auto-flow / auto;
  gap: 8px;
}

.skill-item {
  @include align;
  display: grid;
  grid: auto / auto-flow;
  justify-content: start;
  gap: 16px;
  overflow-x: scroll;
  width: 100%;
}

.ability {
  display: grid;
  grid: auto / auto-flow;
  gap: 4px;
  font-size: $typography-s;
  align-items: center;
  color: $text3;
  position: relative;
  white-space: nowrap;

  & + & {
    &::before {
      content: '';
      display: block;
      position: absolute;
      left: -8px;
      top: 50%;
      width: 2px;
      height: 2px;
      transform: translate(-50%, -50%);
      background-color: $text3;
    }
  }

  & svg {
    font-size: 10px;
  }
}

.button {
  @include align;
}
</style>
