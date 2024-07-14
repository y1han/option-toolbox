<script setup>
import AppFooter from "/src/components/AppFooter.vue";
import NavBar from "/src/components/NavBar.vue";
</script>

<template>
  <a-layout style="margin: 20px">
    <NavBar/>
    <a-layout-content>
      <RouterView />
    </a-layout-content>
    <a-layout-footer>
      <AppFooter />
    </a-layout-footer>
  </a-layout>
</template>

<style scoped>
</style>