<script setup>
import { ref, onMounted } from "vue";
import axios from "axios";

const tasks = ref([]);
const errorMessage = ref("");

const getApiData = async () => {
  try {
    const responseData = await axios.get("http://localhost:8000/tasks");
    if (responseData) {
      tasks.value = responseData.data;
      errorMessage.value = "";
    }
  } catch (err) {
    errorMessage.value = "Some error occurred";
  }
};

onMounted(() => {
  getApiData();
});
</script>

<template>
  <div class="container bg-gray-800 mx-auto text-gray-100 p-3">
    <div
      v-if="errorMessage"
      class="text-center bg-green-600 text-bold text-lg my-2 p-3"
    >
      <p>
        {{ errorMessage }}
      </p>
    </div>
    <h1 class="text-red-400 text-3xl my-3 text-center">TASKS</h1>

    <div className="grid sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-6 px-2 gap-2 my-5">
      <div
        v-for="(item, index) in tasks"
        :key="index"
        class="shadow-lg rounded-md px-4 py-2 bg-violet-800 text-gray-200 text-semibold text-lg"
      >
        <p>
          {{ item }}
        </p>
      </div>
    </div>
  </div>
</template>
