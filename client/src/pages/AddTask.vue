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
    const responseData = await axios.post('http://localhost:8000/tasks', taskData.value)
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
    class="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4"
  >
    <div class="max-w-2xl mx-auto">
      <div v-if="successMessage" class="mb-6 p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg shadow-sm">
        <p class="font-medium">
          {{ successMessage }}
        </p>
      </div>
      
      <div class="bg-white rounded-2xl shadow-xl p-8" 
           data-aos="fade-up"
           data-aos-duration="600"
           data-aos-ease="ease-out">
        
        <div class="text-center mb-8">
          <h1 class="text-3xl font-bold text-gray-800 mb-2">Create New Task</h1>
          <p class="text-gray-600">Add a new task to your schedule</p>
        </div>

        <form @submit.prevent="submitFormData" class="space-y-6">
          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-2" for="title">
              Task Title
            </label>
            <div class="relative">
              <input
                class="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 outline-none"
                id="title"
                type="text"
                placeholder="Enter task title..."
                v-model="taskData.title"
              />
              <font-awesome-icon 
                icon="tasks" 
                class="absolute left-4 top-1/2 transform -translate-y-1/2 text-blue-500"
              />
            </div>
          </div>

          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-2" for="description">
              Description
            </label>
            <div class="relative">
              <textarea
                class="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 outline-none resize-none"
                id="description"
                placeholder="Describe your task..."
                rows="4"
                v-model="taskData.description"
              ></textarea>
              <font-awesome-icon 
                icon="pen-alt" 
                class="absolute left-4 top-4 text-blue-500"
              />
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-2" for="status">
                Status
              </label>
              <select
                class="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 outline-none bg-white"
                v-model="taskData.status"
              >
                <option value="" disabled>Select status</option>
                <option v-for="(item, index) in statusChoices" :key="index" :value="item">
                  {{ item }}
                </option>
              </select>
            </div>

            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-2" for="dueDate">
                Due Date
              </label>
              <input
                class="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 outline-none"
                id="dueDate"
                type="date"
                v-model="taskData.dueDate"
              />
            </div>
          </div>

          <div class="pt-4">
            <button
              class="w-full bg-gradient-to-r from-primary to-secondary hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
              type="submit"
            >
              Create Task
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>
