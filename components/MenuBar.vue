<template>
  <teleport to="body">
    <div class="menu-bar">
      <NuxtLink class="menu-button" to="/">
        <font-awesome-icon icon="music" />
      </NuxtLink>
      <NuxtLink class="menu-button" to="/idol">
        <font-awesome-icon icon="user-group" />
      </NuxtLink>
      <button class="menu-button">
        <font-awesome-icon icon="gear" />
      </button>
    </div>
  </teleport>
</template>
<script setup lang="ts"></script>
<style lang="scss" scoped>
@import './token.scss';
@import './partials/utils.scss';

.menu-button {
  @include reset-button;

  display: grid;
  align-items: center;
  justify-items: center;
  width: 40px;
  height: 40px;
}

.menu-bar {
  position: fixed;
  left: 50%;
  bottom: 16px;
  transform: translateX(-50%);
  border: solid 1px $surface1;
  display: grid;
  grid: auto / auto-flow;
  padding: 0 8px;

  @include background-blur;
  @include round-corner('L');
}
</style>
