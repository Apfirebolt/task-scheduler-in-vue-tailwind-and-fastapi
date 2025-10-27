<script setup>
import { ref, onMounted } from "vue";
import HeaderComponent from './components/Header.vue';
import FooterComponent from './components/Footer.vue';
</script>

<template>
  <header-component />
  <router-view />
  <footer-component />
</template>

<style scoped>

</style>
