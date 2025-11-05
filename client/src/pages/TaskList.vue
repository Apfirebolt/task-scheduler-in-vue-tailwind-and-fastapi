<script setup>
import { ref, onMounted } from "vue";
import AOS from 'aos'
import { useRouter } from "vue-router";
import axios from "axios";
import Loader from "../components/Loader.vue";

const router = useRouter();
const tasks = ref([]);
const errorMessage = ref("");
const isLoading = ref(false);

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
    errorMessage.value = "Failed to load tasks. Please try again.";
    isLoading.value = false;
  }
};

const goToTaskDetail = (taskId) => {
  router.push({
    name: "UpdateTask",
    params: {
      id: taskId
    },
  });
};

const getPriorityColor = (priority) => {
  switch (priority?.toLowerCase()) {
    case 'high': return 'bg-red-100 text-red-800 border-red-200';
    case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    case 'low': return 'bg-green-100 text-green-800 border-green-200';
    default: return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

const getStatusColor = (status) => {
  switch (status?.toLowerCase()) {
    case 'completed': return 'bg-green-100 text-green-800';
    case 'in-progress': return 'bg-blue-100 text-blue-800';
    case 'pending': return 'bg-gray-100 text-gray-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

onMounted(() => {
  AOS.init();
  getApiData();
});
</script>

<template>
  <Loader v-if="isLoading" />
  <div v-else class="min-h-screen bg-gray-50" 
       data-aos="fade-in"
       data-aos-duration="500"
       data-aos-ease="ease"
       data-aos-delay="200">
    
    <!-- Header Section -->
    <div class="bg-white shadow-sm border-b border-gray-200">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-3xl font-bold text-gray-900">Tasks</h1>
            <p class="mt-2 text-gray-600">Manage and track your tasks efficiently</p>
          </div>
          <div class="flex items-center space-x-3">
            <span class="text-sm text-gray-500">Total: {{ tasks.length }} tasks</span>
            <button class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors">
              Add Task
            </button>
          </div>
        </div>
      </div>
    </div>

    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Error Message -->
      <div v-if="errorMessage" 
           class="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
        <div class="flex items-center">
          <svg class="w-5 h-5 text-red-400 mr-3" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
          </svg>
          <p class="text-red-800 font-medium">{{ errorMessage }}</p>
        </div>
      </div>

      <!-- Empty State -->
      <div v-if="!tasks.length && !errorMessage" 
           class="text-center py-16">
        <svg class="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
        <h3 class="text-xl font-medium text-gray-900 mb-2">No tasks found</h3>
        <p class="text-gray-500">Get started by creating your first task.</p>
      </div>

      <!-- Tasks Grid -->
      <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        <div
          v-for="(task, index) in tasks"
          :key="task.id || index"
          class="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md hover:border-gray-300 transition-all duration-200 cursor-pointer group"
          @click="goToTaskDetail(task.id)"
          data-aos="fade-up"
          :data-aos-delay="index * 100"
        >
          <div class="p-6">
            <!-- Task Header -->
            <div class="flex items-start justify-between mb-4">
              <h3 class="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-2">
                {{ task.title }}
              </h3>
              <div class="flex-shrink-0 ml-2">
                <svg class="w-5 h-5 text-gray-400 group-hover:text-blue-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>

            <!-- Task Description -->
            <p class="text-gray-600 text-sm mb-4 line-clamp-3">
              {{ task.description }}
            </p>

            <!-- Task Meta Information -->
            <div class="space-y-3">
              <!-- Due Date -->
              <div class="flex items-center text-sm text-gray-500">
                <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span>Due: {{ new Date(task.dueDate).toLocaleDateString() }}</span>
              </div>

              <!-- Status and Priority Tags -->
              <div class="flex items-center gap-2">
                <span v-if="task.status" 
                      :class="getStatusColor(task.status)"
                      class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium">
                  {{ task.status }}
                </span>
                <span v-if="task.priority" 
                      :class="getPriorityColor(task.priority)"
                      class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border">
                  {{ task.priority }}
                </span>
              </div>
            </div>
          </div>

          <!-- Card Footer -->
          <div class="px-6 py-3 bg-gray-50 border-t border-gray-100 rounded-b-xl">
            <div class="flex items-center justify-between">
              <span class="text-xs text-gray-500">
                ID: {{ task.id }}
              </span>
              <span class="text-xs text-blue-600 group-hover:text-blue-700 font-medium">
                View Details →
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.line-clamp-3 {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
