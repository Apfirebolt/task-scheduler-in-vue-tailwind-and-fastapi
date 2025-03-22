<script setup>
import { ref, onMounted } from "vue";
import HeaderComponent from './components/Header.vue';
import FooterComponent from './components/Footer.vue';

onMounted(() => {
  // access $user global variable
  console.log('On Mounted ',);

})
</script>

<template>
  <header-component />
  <router-view />
  <footer-component />
</template>

<style scoped>

</style>
