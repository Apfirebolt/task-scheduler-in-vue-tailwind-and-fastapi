<script setup>
import { ref, onMounted } from "vue";
import AOS from "aos";
import { useRoute, useRouter } from "vue-router";
import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome"
import { library } from '@fortawesome/fontawesome-svg-core';
import { faTasks, faPenAlt } from '@fortawesome/free-solid-svg-icons';

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
    // Convert date string to datetime format (ISO 8601)
    const dataToSend = {
      ...taskData.value,
      dueDate: taskData.value.dueDate ? `${taskData.value.dueDate}T00:00:00` : null
    }
    
    const responseData = await axios.patch(
      "/tasks/" + route.params.id,
      dataToSend
    );
    if (responseData) {
      successMessage.value = "Task updated successfully!";
      resetSuccessMessage();
    }
  } catch (err) {
    successMessage.value = "";
  }
};

library.add(faTasks, faPenAlt);

const getApiData = async () => {
  try {
    const responseData = await axios.get(
      "/tasks/" + route.params.id
    );
    if (responseData) {
      successMessage.value = "Task data retrieved successfully!";
      taskData.value = responseData.data;
      
      // Convert datetime back to date format for the input field
      if (taskData.value.dueDate) {
        // Extract just the date portion (YYYY-MM-DD)
        const dateObj = new Date(taskData.value.dueDate);
        taskData.value.dueDate = dateObj.toISOString().split('T')[0];
      }
      
      resetSuccessMessage();
    }
  } catch (err) {
    successMessage.value = "";
  }
};

const deleteTaskHandler = async () => {
  try {
    const responseData = await axios.delete(
      "/tasks/" + route.params.id
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
  AOS.init();
  getApiData();
});
</script>

<template>
  <div class="container mx-auto text-light"
    style="background-image: url('https://storage.pixteller.com/designs/designs-images/2019-03-27/05/simple-background-backgrounds-passion-simple-1-5c9b95c3a34f9.png'); background-size: cover; background-position: center;"
  >
    <div
      v-if="successMessage"
      class="text-center bg-success text-light text-bold text-lg my-2 p-3"
    >
      <p>
        {{ successMessage }}
      </p>
    </div>
    <form
      @submit.prevent="submitFormData"
      class="md:w-1/2 sm:w-3/4 mx-auto my-3"
      data-aos="fade-right"
      data-aos-duration="500"
      data-aos-ease="ease"
    >
      <div class="flex items-center justify-between mx-auto my-3 px-2 bg-primary">
        <p class="text-center text-2xl my-3 text-light">UPDATE TASK</p>
        <button
          @click.prevent="deleteTaskHandler"
          class="shadow bg-secondary hover:bg-red-800 focus:shadow-outline focus:outline-none text-white font-bold py-2 px-4 rounded"
        >
          Delete Task
        </button>
      </div>
      <div class="mb-4">
        <label class="block text-dark font-bold bg-light px-2 py-1 text-center" for="title">
          Title
        </label>
        <div class="relative">
          <input
            class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline pr-10"
            id="title"
            type="text"
            placeholder="Task Title"
            v-model="taskData.title"
          />
          <FontAwesomeIcon
            :icon="['fas', 'tasks']"
            class="absolute top-2 right-2 text-primary"
          />
        </div>
      </div>
      <div class="mb-4">
        <label
          class="block text-dark font-bold bg-light px-2 py-1 text-center"
          for="description"
        >
          Description
        </label>
        <div class="relative">
          <textarea
            class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline pr-10"
            id="description"
            type="text"
            placeholder="Task Description"
            rows="10"
            v-model="taskData.description"
          ></textarea>
          <FontAwesomeIcon
            :icon="['fas', 'pen-alt']"
            class="absolute top-2 right-2 text-primary"
          />
        </div>
      </div>
      <div class="mb-4">
        <label class="block text-dark font-bold bg-light px-2 py-1 text-center" for="status">
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
        <label class="block text-dark font-bold bg-light px-2 py-1 text-center" for="dueDate">
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
        class="shadow bg-secondary hover:bg-primary transition-all duration-300 focus:shadow-outline focus:outline-none text-white font-bold py-2 px-4 rounded my-3"
        type="submit"
        value="Update Task"
      />
    </form>
  </div>
</template>
