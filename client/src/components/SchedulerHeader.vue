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

const updateTaskData = (dateValue) => {
  let days = [];
  let daysInCurrentMonth = dateValue.daysInMonth();
  for (let i = 0; i < daysInCurrentMonth; i += 1) {
    let currentDate = dateValue.add(i, "day");
    let currentObject = {
      date: currentDate.format("MMMM D, YYYY"),
      tasks: [],
    };
    // Add tasks that match this date
    tasks.value.forEach(task => {
      if (dayjs(task.dueDate).format("MMMM D, YYYY") === currentDate.format("MMMM D, YYYY")) {
        currentObject.tasks.push(task);
      }
    });
    days.push(currentObject);
  }
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
  <div class="flex items-center justify-between">
      <button
        className="bg-gray-500 hover:bg-gray-900 text-white font-bold py-2 px-4 rounded"
        @click="previousMonth"
      >
        Previous Month
      </button>
      <p className="font-bold text-2xl text-red-400">
        {{ currentMonthAndYear }}
      </p>
      <button
        className="bg-gray-500 hover:bg-gray-900 text-white font-bold py-2 px-4 rounded"
        @click="nextMonth"
      >
        Next Month
      </button>
    </div>
</template>
