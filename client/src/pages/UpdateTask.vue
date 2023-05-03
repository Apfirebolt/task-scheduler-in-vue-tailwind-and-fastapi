<script setup>
import { ref, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import axios from "axios";

const taskData = ref({
  title: "",
  description: "",
});

const route = useRoute();
const router = useRouter();
const successMessage = ref("");
const errorMessage = ref("");

const statusChoices = ["To Do", "In Progress", "In Review", "Done"];

const submitFormData = async () => {
  try {
    const responseData = await axios.patch(
      "http://localhost:8000/tasks/" + route.params.id,
      taskData.value
    );
    if (responseData) {
      successMessage.value = "Task updated successfully!";
      resetSuccessMessage();
    }
  } catch (err) {
    successMessage.value = "";
  }
};

const getApiData = async () => {
  try {
    const responseData = await axios.get(
      "http://localhost:8000/tasks/" + route.params.id
    );
    if (responseData) {
      successMessage.value = "Task data retrieved successfully!";
      taskData.value = responseData.data;
      resetSuccessMessage();
    }
  } catch (err) {
    successMessage.value = "";
  }
};

const deleteTaskHandler = async () => {
  try {
    const responseData = await axios.delete(
      "http://localhost:8000/tasks/" + route.params.id
    );

    if (responseData) {
      router.push({
        name: "TaskList",
      });
    }
  } catch (err) {
    errorMessage.value = "Some error occurred";
    resetErrorMessage();
  }
};

const resetSuccessMessage = () => {
  setTimeout(() => {
    if (successMessage.value) {
      successMessage.value = "";
    }
  }, 5000);
};

const resetErrorMessage = () => {
  setTimeout(() => {
    if (errorMessage.value) {
      errorMessage.value = "";
    }
  }, 3000);
};

onMounted(() => {
  getApiData();
});
</script>

<template>
  <div class="container bg-gray-200 mx-auto text-gray-100 p-3">
    <div
      v-if="successMessage"
      class="text-center bg-green-600 text-bold text-lg my-2 p-3"
    >
      <p>
        {{ successMessage }}
      </p>
    </div>
    <form
      @submit.prevent="submitFormData"
      class="md:w-1/2 sm:w-3/4 mx-auto my-3"
    >
      <div class="flex items-center justify-between mx-auto my-3">
        <p class="text-center text-2xl my-3 text-red-700">UPDATE TASK</p>
        <button
          @click.prevent="deleteTaskHandler"
          class="shadow bg-red-300 hover:bg-red-800 focus:shadow-outline focus:outline-none text-white font-bold py-2 px-4 rounded"
        >
          Delete Task
        </button>
      </div>
      <div class="mb-4">
        <label class="block text-gray-700 text-sm font-bold mb-2" for="title">
          Title
        </label>
        <input
          class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          id="title"
          type="text"
          placeholder="Task Title"
          v-model="taskData.title"
        />
      </div>
      <div class="mb-4">
        <label
          class="block text-gray-700 text-sm font-bold mb-2"
          for="description"
        >
          Description
        </label>
        <textarea
          class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          id="description"
          type="text"
          placeholder="Task Description"
          rows="10"
          v-model="taskData.description"
        ></textarea>
      </div>
      <div class="mb-4">
        <label class="block text-gray-700 text-sm font-bold mb-2" for="status">
          Status
        </label>
        <select
          class="form-select appearance-none block w-full px-3 py-1.5 text-base font-normal text-gray-700 bg-white bg-clip-padding bg-no-repeat border border-solid border-gray-300 rounded transition ease-in-out m-0 focus:text-gray-700 focus:bg-white focus:border-blue-600 focus:outline-none"
          aria-label="Default select example"
          v-model="taskData.status"
        >
          <option
            v-for="(item, index) in statusChoices"
            :key="{ index }"
            :value="item"
          >
            {{ item }}
          </option>
        </select>
      </div>

      <div class="mb-4">
        <label class="block text-gray-700 text-sm font-bold mb-2" for="dueDate">
          Due Date
        </label>
        <input
          class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          id="dueDate"
          type="date"
          placeholder="Select Due Date"
          v-model="taskData.dueDate"
        />
      </div>
      <input
        class="shadow bg-purple-500 hover:bg-purple-400 focus:shadow-outline focus:outline-none text-white font-bold py-2 px-4 rounded"
        type="submit"
        value="Update Task"
      />
    </form>
  </div>
</template>
