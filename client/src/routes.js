import { createWebHistory, createRouter } from "vue-router";
import Home from "./pages/Home.vue"
import Scheduler from "./pages/Scheduler.vue";
import AddTask from "./pages/AddTask.vue";

const routes = [
  {
    path: "/",
    name: "Home",
    component: Home,
  },
  {
    path: "/scheduler",
    name: "Scheduler",
    component: Scheduler,
  },
  {
    path: "/add",
    name: "AddTask",
    component: AddTask,
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;