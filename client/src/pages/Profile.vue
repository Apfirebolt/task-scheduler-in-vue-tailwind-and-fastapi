<script setup>
import { ref, onMounted, computed } from "vue";
import AOS from "aos";
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
  <div
    v-else
    class="min-h-screen bg-gray-50"
    data-aos="fade-in"
    data-aos-duration="500"
    data-aos-ease="ease"
    data-aos-delay="200"
  >
    <!-- Header Section -->
    <div class="bg-white shadow-sm border-b border-gray-200">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div class="flex items-center justify-between">
          <div class="flex items-center space-x-6">
            <!-- Profile Avatar -->
            <div class="relative">
              <div
                class="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg"
              >
                <span class="text-2xl font-bold text-white">
                  {{ profileData?.username?.charAt(0).toUpperCase() || "U" }}
                </span>
              </div>
              <div
                class="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-2 border-white"
              ></div>
            </div>

            <!-- Profile Info -->
            <div>
              <h1 class="text-3xl font-bold text-gray-900 mb-1">
                {{ profileData?.username || "Your Profile" }}
              </h1>
              <p class="text-gray-600 mb-2">
                {{ profileData?.email || "user@example.com" }}
              </p>
              <div class="flex items-center space-x-4 text-sm">
                <span
                  class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800"
                >
                  <svg
                    class="w-3 h-3 mr-1"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fill-rule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clip-rule="evenodd"
                    />
                  </svg>
                  Active
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <!-- Error Message -->
        <div
          v-if="errorMessage"
          class="mb-6 bg-red-50 border border-red-200 rounded-lg p-4"
        >
          <div class="flex items-center">
            <svg
              class="w-5 h-5 text-red-400 mr-3"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fill-rule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                clip-rule="evenodd"
              />
            </svg>
            <p class="text-red-800 font-medium">{{ errorMessage }}</p>
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
