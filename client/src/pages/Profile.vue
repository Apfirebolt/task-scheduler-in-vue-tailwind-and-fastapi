<script setup>
import { ref, onMounted, computed } from "vue";
import AOS from 'aos'
import { useRouter } from "vue-router";
import axios from "axios";
import { useStore } from "vuex";
import * as actionTypes from "../store/modules/auth/authTypes";
import Loader from "../components/Loader.vue";

const router = useRouter();
const store = useStore();
const errorMessage = ref("");
const isLoading = ref(false);

const profileData = computed(() => store.getters[actionTypes.GET_PROFILE]);

const getApiData = async () => {
  try {
    isLoading.value = true;
    const response = await store.dispatch(actionTypes.GET_PROFILE_API_ACTION);
    isLoading.value = false;
  } catch (err) {
    errorMessage.value = "Failed to load profile data. Please try again.";
    isLoading.value = false;
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
            <h1 class="text-3xl font-bold text-gray-900">Profile</h1>
            <p class="mt-2 text-gray-600">Manage and track your profile data</p>
            <p>
                {{ profileData }}
            </p>
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
