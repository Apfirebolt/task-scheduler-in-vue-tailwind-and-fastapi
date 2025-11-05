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
    const responseData = await axios.get("http://localhost:8000/tasks");
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
    class="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6"
    data-aos="fade-in"
  >
    <div class="max-w-7xl mx-auto">
      <!-- Error Message -->
      <div
        v-if="errorMessage"
        class="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg"
      >
        <p class="font-medium">{{ errorMessage }}</p>
      </div>

      <!-- Header -->
      <div class="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6">
        <h1 class="text-3xl font-bold text-slate-800 text-center mb-6">Task Scheduler</h1>
        
        <!-- Navigation -->
        <div class="flex items-center justify-between">
          <button
            class="flex items-center px-4 py-2 bg-slate-600 hover:bg-slate-700 text-white font-medium rounded-lg transition-colors duration-200"
            @click="previousMonth"
          >
            <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
            </svg>
            Previous
          </button>
          
          <h2 class="text-2xl font-semibold text-slate-700">
            {{ currentMonthAndYear }}
          </h2>
          
          <button
            class="flex items-center px-4 py-2 bg-slate-600 hover:bg-slate-700 text-white font-medium rounded-lg transition-colors duration-200"
            @click="nextMonth"
          >
            Next
            <svg class="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
            </svg>
          </button>
        </div>
      </div>

      <!-- Calendar Grid -->
      <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-4">
        <div
          v-for="(item, index) in monthDays"
          :key="index"
          class="bg-white rounded-lg shadow-sm border border-slate-200 p-4 min-h-[200px] hover:shadow-md transition-shadow duration-200"
        >
          <!-- Date Header -->
          <div class="border-b border-slate-100 pb-2 mb-3">
            <p class="font-semibold text-slate-700 text-sm">
              {{ item.date }}
            </p>
          </div>
          
          <!-- Tasks -->
          <div class="space-y-2">
            <div
              v-for="(task, taskIndex) in item.tasks"
              :key="taskIndex"
              class="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-3 hover:shadow-sm transition-shadow duration-200"
            >
              <h3 class="font-medium text-slate-800 text-sm mb-1 line-clamp-1">
                {{ task.title }}
              </h3>
              <p class="text-slate-600 text-xs line-clamp-2">
                {{ task.description }}
              </p>
              <div class="mt-2 flex items-center">
                <span class="inline-block w-2 h-2 bg-blue-400 rounded-full mr-2"></span>
                <span class="text-xs text-slate-500">Task</span>
              </div>
            </div>
            
            <!-- Empty State -->
            <div v-if="item.tasks.length === 0" class="text-center py-4">
              <p class="text-slate-400 text-xs">No tasks scheduled</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
