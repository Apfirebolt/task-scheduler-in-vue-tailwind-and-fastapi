<script setup>
import { cookies } from 'vue-cookies'
import { ref, onMounted } from "vue";
import axios from "axios";
import AOS from "aos";
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome"
import { library } from '@fortawesome/fontawesome-svg-core';
import { faTasks, faPenAlt } from '@fortawesome/free-solid-svg-icons';

const taskData = ref({
  title: "",
  description: "",
});

const successMessage = ref('')

function getCookie(name) {
  const value = `; `;
  const parts = document.cookie.split(value);
  for (let i = 0; i < parts.length; i++) {
    const part = parts[i].split('=');
    if (part[0].trim() === name) {
      return part[1].trim();
    }
  }
  return null;
}

library.add(faTasks, faPenAlt);

// Example usage
const cookieValue = getCookie('fakesession');

console.log('Cookie : ', cookieValue);

const statusChoices = ["To Do", "In Progress", "In Review", "Done"]

onMounted(() => {
  AOS.init();
})

const submitFormData = async () => {

  try {
    // Convert date string to datetime format (ISO 8601)
    const dataToSend = {
      ...taskData.value,
      dueDate: taskData.value.dueDate ? `${taskData.value.dueDate}T00:00:00` : null
    }
    
    const responseData = await axios.post('/tasks/', dataToSend)
    if (responseData) {
      successMessage.value = 'Task created successfully!'
      resetSuccessMessage();
    }
  } catch (err) {
    successMessage.value = ''
  }
}

const resetSuccessMessage = () => {
  setTimeout(() => {
    if (successMessage.value) {
      successMessage.value = ''
    }
  }, 5000)
}

</script>

<template>
  <div 
    class="container bg-gray-200 mx-auto text-gray-100" 
    style="background-image: url('https://storage.pixteller.com/designs/designs-images/2019-03-27/05/simple-background-backgrounds-passion-simple-1-5c9b95c3a34f9.png'); background-size: cover; background-position: center;"
  >
    <div v-if="successMessage" class="text-center bg-success text-light text-bold text-lg my-2 p-3">
      <p>
        {{ successMessage }}
      </p>
    </div>
    <form @submit.prevent="submitFormData" class="md:w-1/2 sm:w-3/4 mx-auto my-3" 
        data-aos="fade-left"
        data-aos-duration="500"
        data-aos-ease="ease">
      <p class="text-center bg-tertiary text-2xl my-3 p-2 text-white">ADD TASK</p>
      <div class="mb-4">
        <label class="block text-dark font-bold bg-light px-2 py-1 text-center" for="title">
          Title
        </label>
        <div class="relative">
          <input
            class="shadow appearance-none border rounded w-full py-2 px-10 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            id="title"
            type="text"
            placeholder="Task Title"
            v-model="taskData.title"
          />
          <font-awesome-icon 
            icon="tasks" 
            class="absolute left-3 top-1/2 transform -translate-y-1/2 text-primary"
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
            class="shadow appearance-none border rounded w-full py-2 px-10 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            id="description"
            type="text"
            placeholder="Task Description"
            rows="10"
            v-model="taskData.description"
          ></textarea>
          <font-awesome-icon 
            icon="pen-alt" 
            class="absolute left-3 top-3 text-primary"
          />
        </div>
      </div>
      <div class="mb-4 flex justify-between items-center">
        <label class="block text-dark font-bold bg-light px-2 py-1 text-center w-1/2" for="status">
          Status
        </label>
        <select
          class="form-select appearance-none block w-1/2 px-3 py-1.5 text-base font-normal text-gray-700 bg-white bg-clip-padding bg-no-repeat border border-solid border-gray-300 rounded transition ease-in-out m-0 focus:text-gray-700 focus:bg-white focus:border-blue-600 focus:outline-none"
          aria-label="Default select example"
          v-model="taskData.status"
        >
        <option v-for="(item, index) in statusChoices" :key="{index}" :value="item">{{ item }}</option>
        </select>
      </div>

      <div class="mb-4 flex justify-between items-center">
        <label class="block text-dark font-bold bg-light px-2 py-1 text-center w-1/2" for="dueDate">
          Due Date
        </label>
        <input
          class="shadow appearance-none border rounded w-1/2 py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          id="dueDate"
          type="date"
          placeholder="Select Due Date"
          v-model="taskData.dueDate"
        />
      </div>
      <input
        class="shadow my-2 bg-secondary hover:bg-accent-dark hover:text-dark transition-all duration-300 focus:shadow-outline focus:outline-none text-white font-bold py-2 px-4 rounded"
        type="submit"
        value="Add Task"
      />
    </form>
  </div>
</template>
