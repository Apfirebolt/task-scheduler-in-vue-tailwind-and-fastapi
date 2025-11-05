<script setup>
import { cookies } from 'vue-cookies'
import { ref, onMounted } from "vue";
import { useRoute, useRouter } from 'vue-router';
import axios from "axios";
import AOS from "aos";
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome"
import { library } from '@fortawesome/fontawesome-svg-core';
import { faTasks, faPenAlt } from '@fortawesome/free-solid-svg-icons';

const route = useRoute();
const router = useRouter();
const taskId = route.params.id;

const taskData = ref({
  title: "",
  description: "",
  status: "",
  dueDate: ""
});

const successMessage = ref('')
const errorMessage = ref('')
const loading = ref(true)

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

const cookieValue = getCookie('fakesession');
console.log('Cookie : ', cookieValue);

const statusChoices = ["To Do", "In Progress", "In Review", "Done"]

onMounted(async () => {
  AOS.init();
  await fetchTask();
})

const fetchTask = async () => {
  try {
    loading.value = true;
    const response = await axios.get(`http://localhost:8000/tasks/${taskId}`);
    if (response.data) {
      taskData.value = {
        title: response.data.title || "",
        description: response.data.description || "",
        status: response.data.status || "",
        dueDate: response.data.due_date ? response.data.due_date.split('T')[0] : ""
      };
    }
  } catch (err) {
    errorMessage.value = 'Failed to load task details';
    console.error('Error fetching task:', err);
  } finally {
    loading.value = false;
  }
}

const submitFormData = async () => {
  try {
    const updateData = {
      title: taskData.value.title,
      description: taskData.value.description,
      status: taskData.value.status,
      due_date: taskData.value.dueDate
    };

    const responseData = await axios.patch(`http://localhost:8000/tasks/${taskId}`, updateData);
    if (responseData) {
      successMessage.value = 'Task updated successfully!';
      resetSuccessMessage();
    }
  } catch (err) {
    errorMessage.value = 'Failed to update task';
    resetErrorMessage();
    console.error('Error updating task:', err);
  }
}

const resetSuccessMessage = () => {
  setTimeout(() => {
    if (successMessage.value) {
      successMessage.value = ''
    }
  }, 5000)
}

const resetErrorMessage = () => {
  setTimeout(() => {
    if (errorMessage.value) {
      errorMessage.value = ''
    }
  }, 5000)
}
</script>

<template>
  <div 
    class="grow bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4"
  >
    <div class="max-w-2xl mx-auto">
      <div v-if="successMessage" class="mb-6 p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg shadow-sm">
        <p class="font-medium">
          {{ successMessage }}
        </p>
      </div>

      <div v-if="errorMessage" class="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg shadow-sm">
        <p class="font-medium">
          {{ errorMessage }}
        </p>
      </div>
      
      <div v-if="loading" class="bg-white rounded-2xl shadow-xl p-8 text-center">
        <p class="text-gray-600">Loading task details...</p>
      </div>

      <div v-else class="bg-white rounded-2xl shadow-xl p-8" 
           data-aos="fade-up"
           data-aos-duration="600"
           data-aos-ease="ease-out">
        
        <div class="text-center mb-8">
          <h1 class="text-3xl font-bold text-gray-800 mb-2">Update Task</h1>
          <p class="text-gray-600">Modify your task details</p>
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
              Update Task
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>
