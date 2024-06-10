<script setup>
import AppFooter from "/src/components/AppFooter.vue";
import NavBar from "/src/components/NavBar.vue";
</script>

<template>
  <v-app>
    <v-main>
      <NavBar/>
      <RouterView />
    </v-main>
    <AppFooter />
  </v-app>
</template>
