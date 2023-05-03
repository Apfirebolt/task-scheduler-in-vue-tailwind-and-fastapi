<script setup>
import { ref, onMounted, computed } from "vue";
import dayjs from "dayjs";
import axios from 'axios';

const monthDays = ref([]);
const tasks = ref([]);
const startDate = ref(dayjs().startOf("month"));

onMounted(() => {
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
  getApiData()
});

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

  monthDays.value = days;
};

const currentMonthAndYear = computed(() => {
  return dayjs(startDate.value).format("MMMM") + ' ' + dayjs(startDate.value).format("YYYY")
})

</script>

<template>
  <div class="container bg-gray-800 mx-auto text-gray-100 p-3">
    <h1 class="text-red-400 text-3xl my-3 text-center">SCHEDULER</h1>
    <div class="flex items-center justify-between">
      <button
        className="bg-gray-500 hover:bg-gray-900 text-white font-bold py-2 px-4 rounded"
        @click="previousMonth"
      >
        Previous Month
      </button>
      <p className="font-bold text-2xl text-red-400">{{ currentMonthAndYear }}</p>
      <button
        className="bg-gray-500 hover:bg-gray-900 text-white font-bold py-2 px-4 rounded"
        @click="nextMonth"
      >
        Next Month
      </button>
    </div>
    <div className="grid grid-cols-7 px-2 gap-2 my-5">
      <div v-for="(item, index) in monthDays" class="shadow-lg rounded-md px-4 py-2 bg-violet-800 text-gray-200 text-semibold text-lg">
        <p>
          {{ item.date }}
        </p>
      </div>
    </div>
    {{ tasks }}
  </div>
</template>
