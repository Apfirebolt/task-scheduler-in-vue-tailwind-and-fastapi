<script setup>
import { onMounted } from "vue";
import AOS from "aos";

onMounted(() => {
  AOS.init();
});
</script>

<template>
  <div class="container bg-gray-200 mx-auto text-gray-100 p-3">
    <p>Scroll Page Example</p>
  </div>
</template>
