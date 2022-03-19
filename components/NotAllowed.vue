<template>
  <div class="not-allowed">
    <Callout>
      <template #title>ユーザーが許可されていません</template>
      ただいま完全許可制になっております。こちらまでご連絡ください。<HelpLink />
    </Callout>
  </div>
</template>
<style lang="scss">
@import '~~/components/partials/token.scss';

.not-allowed {
  @include align;
}
</style>
