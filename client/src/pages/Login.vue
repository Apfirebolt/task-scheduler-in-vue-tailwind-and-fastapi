<script setup>
import { ref, onMounted } from "vue";
import AOS from "aos";
import { useRouter } from "vue-router";
import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
import { library } from "@fortawesome/fontawesome-svg-core";
import { useStore } from "vuex";
import * as actionTypes from "../store/modules/auth/authTypes";
import {
  faUser,
  faLock,
  faEye,
  faEyeSlash,
} from "@fortawesome/free-solid-svg-icons";

const loginData = ref({
  email: "",
  password: "",
});

const router = useRouter();
const successMessage = ref("");
const errorMessage = ref("");
const showPassword = ref(false);
const isLoading = ref(false);
const store = useStore();

const submitFormData = async () => {
  try {
    isLoading.value = true;
    await store.dispatch(actionTypes.SET_TOKEN_ACTION, loginData.value);
    successMessage.value = "Login successful!";
    resetSuccessMessage();
    router.push({ name: "Home" });
  } catch (err) {
    errorMessage.value = "Invalid credentials. Please try again.";
    resetErrorMessage();
  } finally {
    isLoading.value = false;
  }
};

library.add(faUser, faLock, faEye, faEyeSlash);

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

const togglePasswordVisibility = () => {
  showPassword.value = !showPassword.value;
};

onMounted(() => {
  AOS.init();
});
</script>

<template>
  <div
    class="container mx-auto grow bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center p-4"
  >
    <!-- Toast Messages -->
    <Transition name="slide-down">
      <div
        v-if="successMessage"
        class="fixed top-6 left-1/2 transform -translate-x-1/2 z-50 bg-emerald-500 text-white px-6 py-3 rounded-lg shadow-lg border border-emerald-400"
      >
        <div class="flex items-center space-x-2">
          <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path
              fill-rule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
              clip-rule="evenodd"
            />
          </svg>
          <span class="font-medium">{{ successMessage }}</span>
        </div>
      </div>
    </Transition>

    <Transition name="slide-down">
      <div
        v-if="errorMessage"
        class="fixed top-6 left-1/2 transform -translate-x-1/2 z-50 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg border border-red-400"
      >
        <div class="flex items-center space-x-2">
          <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path
              fill-rule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
              clip-rule="evenodd"
            />
          </svg>
          <span class="font-medium">{{ errorMessage }}</span>
        </div>
      </div>
    </Transition>

    <!-- Login Card -->
    <div
      class="w-full max-w-md"
      data-aos="fade-up"
      data-aos-duration="600"
      data-aos-ease="ease-out"
    >
      <form
        @submit.prevent="submitFormData"
        class="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 space-y-6"
      >
        <!-- Header -->
        <div class="text-center space-y-2">
          <div
            class="w-16 h-16 bg-gradient-to-br from-primary to-secondary rounded-xl mx-auto flex items-center justify-center mb-4"
          >
            <FontAwesomeIcon
              :icon="['fas', 'user']"
              class="text-white text-2xl"
            />
          </div>
          <h2 class="text-2xl font-bold text-gray-900">Welcome Back</h2>
          <p class="text-gray-600">Sign in to your account to continue</p>
        </div>

        <!-- Email Field -->
        <div class="space-y-2">
          <label class="block text-sm font-semibold text-gray-700" for="email">
            Email Address
          </label>
          <div class="relative">
            <input
              class="w-full px-4 py-3 pl-11 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              id="email"
              type="email"
              placeholder="Enter your email"
              v-model="loginData.email"
              required
            />
            <FontAwesomeIcon
              :icon="['fas', 'user']"
              class="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
            />
          </div>
        </div>

        <!-- Password Field -->
        <div class="space-y-2">
          <label
            class="block text-sm font-semibold text-gray-700"
            for="password"
          >
            Password
          </label>
          <div class="relative">
            <input
              class="w-full px-4 py-3 pl-11 pr-11 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              id="password"
              :type="showPassword ? 'text' : 'password'"
              placeholder="Enter your password"
              v-model="loginData.password"
              required
            />
            <FontAwesomeIcon
              :icon="['fas', 'lock']"
              class="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
            />
            <button
              type="button"
              @click="togglePasswordVisibility"
              class="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
            >
              <FontAwesomeIcon
                :icon="['fas', showPassword ? 'eye-slash' : 'eye']"
              />
            </button>
          </div>
        </div>

        <!-- Login Button -->
        <button
          type="submit"
          :disabled="isLoading"
          class="w-full bg-gradient-to-r from-primary to-secondary hover:from-blue-600 hover:to-indigo-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-semibold py-3 px-4 rounded-xl shadow-lg hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 transform hover:-translate-y-0.5 disabled:hover:transform-none disabled:cursor-not-allowed"
        >
          <span v-if="!isLoading">Sign In</span>
          <span v-else class="flex items-center justify-center space-x-2">
            <svg class="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
              <circle
                class="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                stroke-width="4"
              ></circle>
              <path
                class="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            <span>Signing In...</span>
          </span>
        </button>

        <!-- Divider -->
        <div class="relative">
          <div class="absolute inset-0 flex items-center">
            <div class="w-full border-t border-gray-200"></div>
          </div>
          <div class="relative flex justify-center text-sm">
            <span class="px-2 bg-white text-gray-500">or</span>
          </div>
        </div>

        <!-- Sign Up Link -->
        <div class="text-center">
          <router-link
            to="/register"
            class="text-blue-600 hover:text-blue-700 font-medium transition-colors duration-200"
          >
            Don't have an account? <span class="underline">Create one</span>
          </router-link>
        </div>
      </form>
    </div>
  </div>
</template>

<style scoped>
.slide-down-enter-active,
.slide-down-leave-active {
  transition: all 0.3s ease;
}

.slide-down-enter-from {
  opacity: 0;
  transform: translateX(-50%) translateY(-20px);
}

.slide-down-leave-to {
  opacity: 0;
  transform: translateX(-50%) translateY(-20px);
}
</style>
