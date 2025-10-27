<script setup>
import { ref, onMounted } from "vue";
import AOS from 'aos'
import { useRouter } from "vue-router";
import axios from "axios";
import Loader from "../components/Loader.vue";

const router = useRouter();
const tasks = ref([]);
const errorMessage = ref("");
const isLoading = ref(false);

const getApiData = async () => {
  try {
    isLoading.value = true;
    const responseData = await axios.get("/tasks/");
    console.log('Response data is ', responseData)
    if (responseData) {
      tasks.value = responseData.data;
      errorMessage.value = "";
      isLoading.value = false;
    }
  } catch (err) {
    errorMessage.value = "Some error occurred";
  }
};

const goToTaskDetail = (taskId) => {
  router.push({
    name: "UpdateTask",
    params: {
      id: taskId
    },
  });
};

onMounted(() => {
  AOS.init();
  getApiData();
});
</script>

<template>
  <Loader v-if="isLoading" />
  <div v-else class="container bg-dark mx-auto text-gray-100 p-3" 
        data-aos="fade-in"
        data-aos-duration="500"
        data-aos-ease="ease"
        data-aos-delay="400">
    <div
      v-if="errorMessage"
      class="text-center bg-success text-light text-bold text-lg my-2 p-3"
    >
      <p>
        {{ errorMessage }}
      </p>
    </div>
    <h1 class="text-light bg-tertiary py-2 text-3xl my-3 text-center">TASKS</h1>

    <div
      className="grid sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-6 px-2 gap-2 my-5"
    >
      <div
        v-for="(item, index) in tasks"
        :key="index"
        class="shadow-lg text-center rounded-md px-4 py-2 bg-secondary hover:cursor-pointer text-light text-semibold text-lg"
        @click="goToTaskDetail(item.id)"
      >
        <p class="my-2 font-bold">
          {{ item.title }}
        </p>
        <p>
          {{ item.description }}
        </p>
        <p>Due on {{ item.dueDate }}</p>
      </div>
    </div>
  </div>
</template>
