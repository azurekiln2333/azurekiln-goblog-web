<template>
  <TopNavBar />
  <main class="pt-20 min-h-screen">
    <router-view />
  </main>
  <SiteFooter />
</template>

<script setup>
import TopNavBar from './TopNavBar.vue'
import SiteFooter from './SiteFooter.vue'
</script>
