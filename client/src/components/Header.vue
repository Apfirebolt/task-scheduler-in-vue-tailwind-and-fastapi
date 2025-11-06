<script setup>
import { ref, computed } from "vue";
import { useStore } from "vuex";
import * as types from "../store/modules/auth/authTypes";

const store = useStore();
const showSidebar = ref(false);
const showMegaMenu = ref(false);

const userProfile = computed(() => store.getters[types.GET_PROFILE_DATA]);

const userName = computed(() => userProfile.value.user.username || userProfile.value.user.email || "Guest");

const toggleSidebar = () => {
  showSidebar.value = !showSidebar.value;
};

const showMenu = () => {
  showMegaMenu.value = true;
};

const hideMenu = () => {
  showMegaMenu.value = false;
};

const logOutUtil = () => {
  store.dispatch(types.LOG_OUT);
};
</script>

<template>
  <!-- Sidebar -->
  <transition
    enter-active-class="duration-300 ease-out"
    enter-from-class="translate -translate-x-64"
    enter-to-class="translate translate-x-0"
    leave-active-class="duration-200 ease-in"
    leave-from-class="opacity-100"
    leave-to-class="transform opacity-0"
  >
    <div v-if="showSidebar">
      <aside
        id="default-sidebar"
        class="fixed left-0 z-40 w-64 h-screen"
        aria-label="Sidebar"
      >
        <div
          class="h-full px-3 py-4 overflow-y-auto bg-primary dark:bg-gray-800"
        >
          <ul class="space-y-2 font-medium">
            <li>
              <router-link
                to="/"
                class="flex items-center p-2 text-light rounded-lg dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <svg
                  aria-hidden="true"
                  class="w-6 h-6 text-light transition duration-75 dark:text-gray-400 group-hover:text-light dark:group-hover:text-white"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M2 10a8 8 0 018-8v8h8a8 8 0 11-16 0z"></path>
                  <path d="M12 2.252A8.014 8.014 0 0117.748 8H12V2.252z"></path>
                </svg>
                <span class="ml-3">Dashboard</span>
              </router-link>
            </li>
            <li>
              <router-link
                to="/scheduler"
                class="flex items-center p-2 text-light rounded-lg dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <svg
                  aria-hidden="true"
                  class="flex-shrink-0 w-6 h-6 text-light transition duration-75 dark:text-gray-400 group-hover:text-light dark:group-hover:text-white"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M8.707 7.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l2-2a1 1 0 00-1.414-1.414L11 7.586V3a1 1 0 10-2 0v4.586l-.293-.293z"
                  ></path>
                  <path
                    d="M3 5a2 2 0 012-2h1a1 1 0 010 2H5v7h2l1 2h4l1-2h2V5h-1a1 1 0 110-2h1a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2V5z"
                  ></path>
                </svg>
                <span class="flex-1 ml-3 whitespace-nowrap">Scheduler</span>
              </router-link>
            </li>
            <li>
              <router-link
                to="/add"
                class="flex items-center p-2 text-light rounded-lg dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <svg
                  aria-hidden="true"
                  class="flex-shrink-0 w-6 h-6 text-light transition duration-75 dark:text-gray-400 group-hover:text-light dark:group-hover:text-white"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    fill-rule="evenodd"
                    d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                    clip-rule="evenodd"
                  ></path>
                </svg>
                <span class="flex-1 ml-3 whitespace-nowrap">Add Task</span>
              </router-link>
            </li>
            <li>
              <router-link
                to="/tasks"
                class="flex items-center p-2 text-light rounded-lg dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <svg
                  aria-hidden="true"
                  class="flex-shrink-0 w-6 h-6 text-light transition duration-75 dark:text-gray-400 group-hover:text-light dark:group-hover:text-white"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    fill-rule="evenodd"
                    d="M10 2a4 4 0 00-4 4v1H5a1 1 0 00-.994.89l-1 9A1 1 0 004 18h12a1 1 0 00.994-1.11l-1-9A1 1 0 0015 7h-1V6a4 4 0 00-4-4zm2 5V6a2 2 0 10-4 0v1h4zm-6 3a1 1 0 112 0 1 1 0 01-2 0zm7-1a1 1 0 100 2 1 1 0 000-2z"
                    clip-rule="evenodd"
                  ></path>
                </svg>
                <span class="flex-1 ml-3 whitespace-nowrap">Tasks</span>
              </router-link>
            </li>
          </ul>
        </div>
      </aside>
    </div>
  </transition>

  <!-- Header -->
  <header class="relative bg-white shadow-lg border-b border-gray-200">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex items-center justify-between h-16">
        <!-- Logo -->
        <div class="flex items-center">
          <h1 class="text-2xl font-bold text-gray-900">Task Scheduler</h1>
          <div v-if="userProfile" class="ml-4 text-sm text-gray-600">
            <span>Welcome, {{ userName }}</span>
          </div>
        </div>

        <!-- Desktop Navigation -->
        <nav class="hidden md:flex space-x-8">
          <router-link
            to="/"
            class="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200"
          >
            Home
          </router-link>
          <router-link
            to="/scheduler"
            class="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200"
          >
            Scheduler
          </router-link>
          <router-link
            to="/add"
            class="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200"
          >
            Add Task
          </router-link>

          <!-- Mega Menu Trigger -->
          <div class="relative" @mouseenter="showMenu" @mouseleave="hideMenu">
            <button
              class="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 flex items-center"
            >
              More
              <svg class="ml-1 h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fill-rule="evenodd"
                  d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                  clip-rule="evenodd"
                />
              </svg>
            </button>

            <!-- Mega Menu -->
            <transition
              enter-active-class="transition ease-out duration-200"
              enter-from-class="opacity-0 translate-y-1"
              enter-to-class="opacity-100 translate-y-0"
              leave-active-class="transition ease-in duration-150"
              leave-from-class="opacity-100 translate-y-0"
              leave-to-class="opacity-0 translate-y-1"
            >
              <div
                v-show="showMegaMenu"
                class="absolute z-50 left-1/2 transform -translate-x-1/2 mt-3 px-2 w-screen max-w-md sm:px-0"
              >
                <div
                  class="rounded-lg shadow-lg ring-1 ring-black ring-opacity-5 overflow-hidden"
                >
                  <div
                    class="relative grid gap-6 bg-white px-5 py-6 sm:gap-8 sm:p-8"
                  >
                    <router-link
                      to="/tasks"
                      class="-m-3 p-3 flex items-start rounded-lg hover:bg-gray-50 transition ease-in-out duration-150"
                    >
                      <div class="flex-shrink-0">
                        <svg
                          class="h-6 w-6 text-blue-600"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="2"
                            d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
                          />
                        </svg>
                      </div>
                      <div class="ml-4">
                        <p class="text-base font-medium text-gray-900">Tasks</p>
                        <p class="mt-1 text-sm text-gray-500">
                          View and manage all your tasks
                        </p>
                      </div>
                    </router-link>

                    <router-link
                      to="/task-table"
                      class="-m-3 p-3 flex items-start rounded-lg hover:bg-gray-50 transition ease-in-out duration-150"
                    >
                      <div class="flex-shrink-0">
                        <svg
                          class="h-6 w-6 text-blue-600"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="2"
                            d="M3 10h18M3 6h18m-9 8h9m-9 4h9m-9-8H3m0 4h6"
                          />
                        </svg>
                      </div>
                      <div class="ml-4">
                        <p class="text-base font-medium text-gray-900">
                          Task Table
                        </p>
                        <p class="mt-1 text-sm text-gray-500">
                          Tabular view of all tasks
                        </p>
                      </div>
                    </router-link>

                    <router-link
                      v-if="!userProfile"
                      to="/login"
                      class="-m-3 p-3 flex items-start rounded-lg hover:bg-gray-50 transition ease-in-out duration-150"
                    >
                      <div class="flex-shrink-0">
                        <svg
                          class="h-6 w-6 text-blue-600"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="2"
                            d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"
                          />
                        </svg>
                      </div>
                      <div class="ml-4">
                        <p class="text-base font-medium text-gray-900">
                          Login
                        </p>
                        <p class="mt-1 text-sm text-gray-500">
                          Sign in to your account
                        </p>
                      </div>
                    </router-link>

                    <router-link v-if="!userProfile"
                      to="/register"
                      class="-m-3 p-3 flex items-start rounded-lg hover:bg-gray-50 transition ease-in-out duration-150"
                    >
                      <div class="flex-shrink-0">
                        <svg
                          class="h-6 w-6 text-blue-600"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="2"
                            d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
                          />
                        </svg>
                      </div>
                      <div class="ml-4">
                        <p class="text-base font-medium text-gray-900">
                          Register
                        </p>
                        <p class="mt-1 text-sm text-gray-500">
                          Create a new account
                        </p>
                      </div>
                    </router-link>

                    <router-link
                      v-if="userProfile"
                      to="/profile"
                      class="-m-3 p-3 flex items-start rounded-lg hover:bg-gray-50 transition ease-in-out duration-150"
                    >
                      <div class="flex-shrink-0">
                        <svg
                          class="h-6 w-6 text-blue-600"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="2"
                            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                          />
                        </svg>
                      </div>
                      <div class="ml-4">
                        <p class="text-base font-medium text-gray-900">
                          Profile
                        </p>
                        <p class="mt-1 text-sm text-gray-500">
                          View and edit your profile
                        </p>
                      </div>
                    </router-link>

                    <button
                      v-if="userProfile"
                      @click="logOutUtil"
                      class="-m-3 p-3 flex items-start rounded-lg hover:bg-gray-50 transition ease-in-out duration-150"
                    >
                      <div class="flex-shrink-0">
                        <svg
                          class="h-6 w-6 text-blue-600"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="2"
                            d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                          />
                        </svg>
                      </div>
                      <div class="ml-4">
                        <p class="text-base font-medium text-gray-900">
                          Logout
                        </p>
                        <p class="mt-1 text-sm text-gray-500">
                          Sign out of your account
                        </p>
                      </div>
                    </button>
                  </div>
                </div>
              </div>
            </transition>
          </div>
        </nav>

        <!-- Mobile menu button -->
        <div class="md:hidden">
          <button
            @click="toggleSidebar"
            class="text-gray-700 hover:text-blue-600 p-2 rounded-md transition-colors duration-200"
          >
            <svg
              class="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  </header>
</template>
