<template>
  <Layout>
    <template #heading>アイドル</template>
    <div class="aligned">
      <Callout>
        <template #title>工事中</template>
        アイドルとスキルを一覧してソートしたりフィルタしたりできるページになる予定。
      </Callout>
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
              <div v-for="skill in idol.skills" :key="skill.id">
                <span class="skill-type">{{ skill.type.toUpperCase() }}</span
                ><span v-if="skill.type !== 'sp'" class="skill-ct">{{ skill.ct }}</span>
              </div>
            </div>
          </div>
        </li>
      </ul>
      <ButtonLink to="/idol/new">アイドルを追加する</ButtonLink>
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

.aligned {
  @include align;

  display: grid;
  grid: auto-flow / auto;
  gap: 16px;
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
  }

  &.dance {
    background-color: $dance;
  }

  &.visual {
    background-color: $visual;
  }
}

.status {
  display: grid;
  grid: auto / auto-flow;
  justify-content: start;
}

.skill-overview {
  @include round-corner;
  display: grid;
  grid: auto / auto-flow;
  gap: 4px;
  justify-content: start;
  padding: 4px 8px;
  border: solid 1px $surface1;
}

.skill-type {
  font-size: $typography-s;
  color: $text1;
}

.skill-ct {
  font-size: $typography-s;
  color: $text3;
  margin-left: 2px;
}
</style>
