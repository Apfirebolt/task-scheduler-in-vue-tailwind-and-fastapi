<script setup>
import { ref, onMounted } from "vue";
import HeaderComponent from './components/Header.vue';
import FooterComponent from './components/Footer.vue';
</script>

<template>
  <div class="app-container">
    <header-component />
    <router-view />
    <footer-component />
  </div>
</template>

<style scoped>
.app-container {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

main {
    flex-grow: 1;
}

</style>