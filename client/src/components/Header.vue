<script setup>
import { ref } from "vue";

const showSidebar = ref(false);

const toggleSidebar = () => {
  showSidebar.value = !showSidebar.value;
};
</script>

<template>
  <!-- component -->
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
                href="#"
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
                href="#"
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
                href="#"
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
                href="#"
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
  <header
    class="header top-0 bg-gradient-to-r from-primary to-secondary shadow-md flex items-center justify-between px-8 py-02"
  >
    <!-- logo -->
    <h1 class="w-3/12 text-light">
      Task Scheduler
    </h1>

    <!-- navigation -->
    <nav class="nav font-semibold text-lg text-light">
      <ul class="md:flex items-center hidden">
        <li
          class="p-4 border-b-2 border-success border-opacity-0 hover:border-opacity-100 hover:text-success duration-200 cursor-pointer active"
        >
          <router-link to="/">Home</router-link>
        </li>
        <li
          class="p-4 border-b-2 border-success border-opacity-0 hover:border-opacity-100 hover:text-success duration-200 cursor-pointer"
        >
          <router-link to="/scheduler">Scheduler</router-link>
        </li>
        <li
          class="p-4 border-b-2 border-success border-opacity-0 hover:border-opacity-100 hover:text-success duration-200 cursor-pointer"
        >
          <router-link to="/add">Add Task</router-link>
        </li>
        <li
          class="p-4 border-b-2 border-success border-opacity-0 hover:border-opacity-100 hover:text-success duration-200 cursor-pointer"
        >
          <router-link to="/tasks">Tasks</router-link>
        </li>
        <li
          class="p-4 border-b-2 border-success border-opacity-0 hover:border-opacity-100 hover:text-success duration-200 cursor-pointer"
        >
          <router-link to="/task-table">Task Table</router-link>
        </li>
      </ul>
      <ul class="flex items-center">
        <li
          @click="toggleSidebar"
          class="p-4 border-b-2 md:hidden border-success border-opacity-0 hover:border-opacity-100 hover:text-success duration-200 cursor-pointer active"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="32"
            height="32"
            fill="currentColor"
            class="bi bi-bar-chart"
            viewBox="0 0 16 16"
          >
            <path
              d="M4 11H2v3h2v-3zm5-4H7v7h2V7zm5-5v12h-2V2h2zm-2-1a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h2a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1h-2zM6 7a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v7a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V7zm-5 4a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1v-3z"
            />
          </svg>
        </li>
      </ul>
    </nav>
  </header>
</template>
