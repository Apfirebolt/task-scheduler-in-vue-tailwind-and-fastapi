<script setup>
import { ref, onMounted } from "vue";
import dayjs from "dayjs";

const monthDays = ref([]);
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
});

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
</script>

<template>
  <div class="container bg-gray-800 mx-auto text-gray-100 p-3">
    <h1 class="text-red-400 text-3xl">Scheduler</h1>
    <div class="flex items-center justify-between">
      <button
        className="bg-gray-500 hover:bg-gray-900 text-white font-bold py-2 px-4 rounded"
        @click="previousMonth"
      >
        Previous Month
      </button>
      <p className="font-bold text-2xl text-red-400">Current</p>
      <button
        className="bg-gray-500 hover:bg-gray-900 text-white font-bold py-2 px-4 rounded"
        @click="nextMonth"
      >
        Next Month
      </button>
    </div>
    <div className="grid grid-cols-7 px-2 gap-2">
      <div v-for="(item, index) in monthDays">
        {{ item }}
      </div>
    </div>
  </div>
</template>
