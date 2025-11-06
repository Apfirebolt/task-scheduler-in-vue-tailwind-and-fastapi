<script setup>
import { ref, onMounted, computed } from "vue";
import AOS from "aos";
import { useRouter } from "vue-router";
import axios from "axios";
import Loader from "../components/Loader.vue";

const router = useRouter();
const tasks = ref([]);
const errorMessage = ref("");
const title = ref("");
const description = ref("");
const isLoading = ref(false);
const sortingParam = ref("");
const sortingParams = ref({
  name: "",
  reverse: false,
});

const getApiData = async () => {
  try {
    isLoading.value = true;
    const responseData = await axios.get("http://localhost:8000/tasks");
    if (responseData) {
      tasks.value = responseData.data;
      errorMessage.value = "";
      isLoading.value = false;
    }
  } catch (err) {
    errorMessage.value = "Some error occurred";
  }
};

let filteredTasks = computed(() => {
  let filtered = tasks.value.filter((task) => {
    return (
      task.title.toLowerCase().includes(title.value.toLowerCase()) &&
      task.description.toLowerCase().includes(description.value.toLowerCase())
    );
  });
  return filtered.sort((a, b) => {
    if (sortingParams.value["reverse"]) {
      return a[sortingParam.value] > b[sortingParam.value] ? 1 : -1;
    } else {
      return a[sortingParam.value] > b[sortingParam.value] ? -1 : 1;
    }
  });
});

const goToTaskDetail = (taskId) => {
  router.push({
    name: "UpdateTask",
    params: {
      id: taskId,
    },
  });
};

const sortByParam = (param) => {
  sortingParam.value = param;

  if (sortingParams.value["name"] === param) {
    sortingParams.value = {
      name: param,
      reverse: !sortingParams.value["reverse"],
    };
  } else {
    sortingParams.value = {
      name: param,
      reverse: false,
    };
  }
};

onMounted(() => {
  AOS.init();
  getApiData();
});
</script>

<template>
  <Loader v-if="isLoading" />
  <div
    v-else
    class="container bg-light mx-auto text-dark p-3"
    data-aos="fade-in"
    data-aos-duration="500"
    data-aos-ease="ease"
    data-aos-delay="400"
  >
    <div
      v-if="errorMessage"
      class="text-center bg-green-600 text-bold text-lg my-2 p-3"
    >
      <p>
        {{ errorMessage }}
      </p>
      <p>
        {{ sortByParams }}
      </p>
    </div>
    <div class="bg-white rounded-lg shadow-lg overflow-hidden">
      <div class="bg-gradient-to-r from-primary to-secondary px-6 py-4">
        <h1 class="text-white text-2xl font-bold text-center">
          Task Management
        </h1>
      </div>

      <!-- Search Filters -->
      <div class="p-6 bg-gray-50 border-b">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div class="relative">
            <label class="block text-sm font-medium text-gray-700 mb-2"
              >Search by Title</label
            >
            <input
              type="text"
              v-model="title"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              placeholder="Enter task title..."
            />
          </div>
          <div class="relative">
            <label class="block text-sm font-medium text-gray-700 mb-2"
              >Search by Description</label
            >
            <input
              type="text"
              v-model="description"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              placeholder="Enter description..."
            />
          </div>
        </div>
      </div>

      <!-- Table -->
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                #
              </th>
              <th
                @click="sortByParam('title')"
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors duration-150"
              >
                <div class="flex items-center space-x-1">
                  <span>Title</span>
                  <svg
                    v-if="sortingParams.name === 'title'"
                    class="w-4 h-4 transition-transform duration-200"
                    :class="{ 'rotate-180': !sortingParams.reverse }"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </div>
              </th>
              <th
                @click="sortByParam('description')"
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors duration-150"
              >
                <div class="flex items-center space-x-1">
                  <span>Description</span>
                  <svg
                    v-if="sortingParams.name === 'description'"
                    class="w-4 h-4 transition-transform duration-200"
                    :class="{ 'rotate-180': !sortingParams.reverse }"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </div>
              </th>
              <th
                @click="sortByParam('dueDate')"
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors duration-150"
              >
                <div class="flex items-center space-x-1">
                  <span>Due Date</span>
                  <svg
                    v-if="sortingParams.name === 'dueDate'"
                    class="w-4 h-4 transition-transform duration-200"
                    :class="{ 'rotate-180': !sortingParams.reverse }"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </div>
              </th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr
              v-for="(item, index) in filteredTasks"
              :key="index"
              @click="goToTaskDetail(item.id)"
              class="hover:bg-gray-50 cursor-pointer transition-colors duration-150"
            >
              <td
                class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900"
              >
                {{ index + 1 }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm font-medium text-gray-900">
                  {{ item.title }}
                </div>
              </td>
              <td class="px-6 py-4">
                <div class="text-sm text-gray-700 max-w-xs truncate">
                  {{ item.description }}
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                {{ item.dueDate }}
              </td>
            </tr>
            <tr v-if="filteredTasks.length === 0">
              <td colspan="4" class="px-6 py-12 text-center text-gray-500">
                <div class="flex flex-col items-center">
                  <svg
                    class="w-12 h-12 text-gray-300 mb-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                  <p class="text-lg font-medium">No tasks found</p>
                  <p class="text-sm">Try adjusting your search criteria</p>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>
