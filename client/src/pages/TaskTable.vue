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
    const responseData = await axios.get("/tasks/");
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
    <h1 class="text-tertiary bg-white py-2 text-3xl my-3 text-center">TASKS</h1>
    <div class="flex flex-col">
      <div class="overflow-x-auto sm:-mx-6 lg:-mx-8">
        <div class="inline-block min-w-full py-2 sm:px-6 lg:px-8">
          <div class="overflow-hidden">
            <table class="min-w-full text-left text-sm font-light">
              <thead class="border-b font-medium dark:border-neutral-500">
                <tr>
                  <th scope="col" class="px-6 py-4">#</th>
                  <th scope="col" class="px-6 py-4" @click="sortByParam('title')">
                    Title
                    <svg v-if="sortingParams.name === 'title' && sortingParams.reverse"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke-width="1.5"
                      stroke="currentColor"
                      class="w-6 h-6"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        d="m4.5 5.25 7.5 7.5 7.5-7.5m-15 6 7.5 7.5 7.5-7.5"
                      />
                    </svg>

                    <svg v-if="sortingParams.name === 'title' && !sortingParams.reverse"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke-width="1.5"
                      stroke="currentColor"
                      class="w-6 h-6"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        d="m4.5 18.75 7.5-7.5 7.5 7.5"
                      />
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        d="m4.5 12.75 7.5-7.5 7.5 7.5"
                      />
                    </svg>
                  </th>
                  <th scope="col" class="px-6 py-4" @click="sortByParam('description')">
                    Description
                    <svg v-if="sortingParams.name === 'description' && sortingParams.reverse"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke-width="1.5"
                      stroke="currentColor"
                      class="w-6 h-6"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        d="m4.5 5.25 7.5 7.5 7.5-7.5m-15 6 7.5 7.5 7.5-7.5"
                      />
                    </svg>

                    <svg v-if="sortingParams.name === 'description' && !sortingParams.reverse"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke-width="1.5"
                      stroke="currentColor"
                      class="w-6 h-6"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        d="m4.5 18.75 7.5-7.5 7.5 7.5"
                      />
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        d="m4.5 12.75 7.5-7.5 7.5 7.5"
                      />
                    </svg>
                  </th>
                  <th scope="col" class="px-6 py-4 flex justify-around">
                    Due Date
                    <svg
                      @click="sortByParam('dueDate')"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke-width="1.5"
                      stroke="currentColor"
                      class="w-6 h-6"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        d="m4.5 5.25 7.5 7.5 7.5-7.5m-15 6 7.5 7.5 7.5-7.5"
                      />
                    </svg>
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td class="whitespace-nowrap px-6 py-4 font-medium"></td>
                  <td class="whitespace-nowrap px-6 py-4 font-medium">
                    <input
                      type="text"
                      id="first_name"
                      v-model="title"
                      class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                      placeholder="Search Title"
                      required
                    />
                  </td>
                  <td class="whitespace-nowrap px-6 py-4 font-medium">
                    <input
                      type="text"
                      id="first_name"
                      v-model="description"
                      class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                      placeholder="Search Description"
                      required
                    />
                  </td>
                  <td class="whitespace-nowrap px-6 py-4 font-medium"></td>
                </tr>
                <tr
                  v-for="(item, index) in filteredTasks"
                  class="border-b dark:border-neutral-500"
                  :key="index"
                  @click="goToTaskDetail(item.id)"
                >
                  <td class="whitespace-nowrap px-6 py-4 font-medium">
                    {{ index + 1 }}
                  </td>
                  <td class="whitespace-nowrap px-6 py-4">
                    {{ item.title }}
                  </td>
                  <td class="whitespace-nowrap px-6 py-4">
                    {{ item.description }}
                  </td>
                  <td class="whitespace-nowrap px-6 py-4">
                    {{ item.dueDate }}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
