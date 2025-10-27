<script setup>
import { ref, onMounted } from "vue";
import AOS from "aos";
import { useRouter } from "vue-router";
import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
import { library } from "@fortawesome/fontawesome-svg-core";
import {
  faUser,
  faLock,
  faEnvelope,
  faIdCard,
} from "@fortawesome/free-solid-svg-icons";

const registerData = ref({
  username: "",
  firstName: "",
  lastName: "",
  email: "",
  password: "",
});

const router = useRouter();
const successMessage = ref("");
const errorMessage = ref("");

const submitFormData = async () => {
  try {
    const responseData = await axios.post(
      "/auth/register",
      registerData.value
    );
    if (responseData) {
      successMessage.value = "Registration successful!";
      resetSuccessMessage();
      router.push({ name: "Login" });
    }
  } catch (err) {
    errorMessage.value = "Registration failed. Please try again.";
    resetErrorMessage();
  }
};

library.add(faUser, faLock, faEnvelope, faIdCard);

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
});
</script>

<template>
  <div
    class="container mx-auto text-light min-h-screen flex items-center justify-center"
    style="
      background-image: url('https://storage.pixteller.com/designs/designs-images/2019-03-27/05/simple-background-backgrounds-passion-simple-1-5c9b95c3a34f9.png');
      background-size: cover;
      background-position: center;
    "
  >
    <div
      v-if="successMessage"
      class="fixed top-4 left-1/2 transform -translate-x-1/2 bg-green-500 text-white text-bold text-lg p-3 rounded"
    >
      <p>{{ successMessage }}</p>
    </div>
    <div
      v-if="errorMessage"
      class="fixed top-4 left-1/2 transform -translate-x-1/2 bg-red-500 text-white text-bold text-lg p-3 rounded"
    >
      <p>{{ errorMessage }}</p>
    </div>

    <form
      @submit.prevent="submitFormData"
      class="w-full max-w-md mx-auto bg-white bg-opacity-90 p-8 rounded-lg shadow-lg"
      data-aos="fade-up"
      data-aos-duration="500"
      data-aos-ease="ease"
    >
      <div class="text-center mb-6">
        <h2 class="text-3xl font-bold text-gray-800">REGISTER</h2>
      </div>

      <div class="mb-4">
        <label class="block text-gray-700 font-bold mb-2" for="username">
          Username
        </label>
        <div class="relative">
          <input
            class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline pr-10"
            id="username"
            type="text"
            placeholder="Enter your username"
            v-model="registerData.username"
            required
          />
          <FontAwesomeIcon
            :icon="['fas', 'user']"
            class="absolute top-2 right-2 text-gray-500"
          />
        </div>
      </div>

      <div class="mb-4">
        <label class="block text-gray-700 font-bold mb-2" for="firstName">
          First Name
        </label>
        <div class="relative">
          <input
            class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline pr-10"
            id="firstName"
            type="text"
            placeholder="Enter your first name"
            v-model="registerData.firstName"
            required
          />
          <FontAwesomeIcon
            :icon="['fas', 'id-card']"
            class="absolute top-2 right-2 text-gray-500"
          />
        </div>
      </div>

      <div class="mb-4">
        <label class="block text-gray-700 font-bold mb-2" for="lastName">
          Last Name
        </label>
        <div class="relative">
          <input
            class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline pr-10"
            id="lastName"
            type="text"
            placeholder="Enter your last name"
            v-model="registerData.lastName"
            required
          />
          <FontAwesomeIcon
            :icon="['fas', 'id-card']"
            class="absolute top-2 right-2 text-gray-500"
          />
        </div>
      </div>

      <div class="mb-4">
        <label class="block text-gray-700 font-bold mb-2" for="email">
          Email
        </label>
        <div class="relative">
          <input
            class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline pr-10"
            id="email"
            type="email"
            placeholder="Enter your email"
            v-model="registerData.email"
            required
          />
          <FontAwesomeIcon
            :icon="['fas', 'envelope']"
            class="absolute top-2 right-2 text-gray-500"
          />
        </div>
      </div>

      <div class="mb-6">
        <label class="block text-gray-700 font-bold mb-2" for="password">
          Password
        </label>
        <div class="relative">
          <input
            class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline pr-10"
            id="password"
            type="password"
            placeholder="Enter your password"
            v-model="registerData.password"
            required
          />
          <FontAwesomeIcon
            :icon="['fas', 'lock']"
            class="absolute top-2 right-2 text-gray-500"
          />
        </div>
      </div>

      <input
        class="w-full shadow bg-blue-500 hover:bg-blue-700 transition-all duration-300 focus:shadow-outline focus:outline-none text-white font-bold py-2 px-4 rounded cursor-pointer"
        type="submit"
        value="Register"
      />

      <div class="text-center mt-4">
        <router-link to="/login" class="text-blue-500 hover:text-blue-700">
          Already have an account? Sign in
        </router-link>
      </div>
    </form>
  </div>
</template>
