import { createWebHistory, createRouter } from "vue-router";
import Home from "./pages/Home.vue"
import Scheduler from "./pages/Scheduler.vue";

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
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;