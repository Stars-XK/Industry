<template>
  <router-view />
</template>

<script setup lang="ts">
</script>

<style>
body, html {
  margin: 0;
  padding: 0;
  height: 100%;
  background-color: var(--el-bg-color-page);
  color: var(--el-text-color-primary);
  font-family: "SF Pro Display", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
#app {
  height: 100%;
}
</style>
