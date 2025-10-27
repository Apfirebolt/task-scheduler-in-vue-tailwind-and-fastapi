<script setup>
import { ref, onMounted, computed } from "vue";
import AOS from "aos";
import Loader from "../components/Loader.vue";
import dayjs from "dayjs";
import axios from "axios";

const monthDays = ref([]);
const tasks = ref([]);
const startDate = ref(dayjs().startOf("month"));
const errorMessage = ref("");
const isLoading = ref(false);
const showInfo = ref(false);

onMounted(() => {
  AOS.init();
  let days = [];
  let daysInCurrentMonth = startDate.value.daysInMonth();
  for (let i = 0; i < daysInCurrentMonth; i += 1) {
    let currentDate = startDate.value.add(i, "day");
    let currentObject = {
      date: currentDate.format("MMMM D, YYYY"),
      tasks: [],
    };
    days.push(currentObject);
  }
  monthDays.value = days;
  getApiData();
});

const getApiData = async () => {
  try {
    isLoading.value = true;
    const responseData = await axios.get("/tasks/");
    if (responseData) {
      tasks.value = responseData.data;
      errorMessage.value = "";
      updateTaskData(startDate.value);
      isLoading.value = false;
    }
  } catch (err) {
    console.log(err);
    errorMessage.value = "Some error occurred";
  }
};

const nextMonth = () => {
  let nextMonthValue = startDate.value.add(1, "month");
  startDate.value = nextMonthValue;
  updateTaskData(nextMonthValue);
};

const previousMonth = () => {
  let previousMonthValue = startDate.value.add(-1, "month");
  startDate.value = previousMonthValue;
  updateTaskData(previousMonthValue);
};

const updateTaskData = (month) => {
  let days = [];
  let daysInCurrentMonth = month.daysInMonth();
  for (let i = 0; i < daysInCurrentMonth; i += 1) {
    let currentDate = startDate.value.add(i, "day");
    let currentObject = {
      date: currentDate.format("MMMM D, YYYY"),
      tasks: [],
    };
    days.push(currentObject);
  }

  if (tasks.value.length) {
    tasks.value.forEach((item) => {
      let currentDate = dayjs(item["dueDate"]).format("MMMM D, YYYY");
      let dateObj = days.find((item) => item.date === currentDate);
      if (dateObj) {
        dateObj.tasks.push(item);
      }
    });
  }
  console.log(days);
  monthDays.value = days;
};

const currentMonthAndYear = computed(() => {
  return (
    dayjs(startDate.value).format("MMMM") +
    " " +
    dayjs(startDate.value).format("YYYY")
  );
});
</script>

<template>
  <Loader v-if="isLoading" />
  <div
    v-else
    class="container bg-light mx-auto text-dark p-3"
    data-aos="zoom-in"
    style="background-image: url('https://storage.pixteller.com/designs/designs-images/2019-03-27/05/simple-background-backgrounds-passion-simple-1-5c9b95c3a34f9.png'); background-size: cover; background-position: center;"
  >
    <div
      v-if="errorMessage"
      class="text-center bg-tertiary text-bold text-lg my-2 p-3"
    >
      <p>
        {{ errorMessage }}
      </p>
    </div>
    <h1 class="text-red-400 text-3xl my-3 text-center">SCHEDULER</h1>
    <div class="flex items-center justify-between">
      <button
        className="bg-secondary hover:bg-gray-900 text-white font-bold py-2 px-4 rounded"
        @click="previousMonth"
      >
        Previous Month
      </button>
      <p className="font-bold text-2xl text-red-400">
        {{ currentMonthAndYear }}
      </p>
      <button
        className="bg-secondary hover:bg-gray-900 text-white font-bold py-2 px-4 rounded"
        @click="nextMonth"
      >
        Next Month
      </button>
    </div>
    <div
      className="grid sm:grid-cols-2 md:grid-cols:4 lg:grid-cols-7 px-2 gap-2 my-5"
    >
      <div
        v-for="(item, index) in monthDays"
        class="shadow-lg rounded-md px-4 py-2 bg-primary text-light text-semibold text-lg"
      >
        <p>
          {{ item.date }}
        </p>
        <div
          v-for="(task, index) in item.tasks"
          class="max-w-sm rounded overflow-hidden shadow-lg bg-gray-800 my-2"
        >
          <div class="px-6 py-4">
            <div class="font-bold text-xl mb-2">{{ task.title }}</div>
            <p class="text-gray-100 text-base">
              {{ task.description }}
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
