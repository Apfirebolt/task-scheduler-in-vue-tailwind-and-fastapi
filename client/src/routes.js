import { createWebHistory, createRouter } from "vue-router";
import Home from "./pages/Home.vue"
import Scheduler from "./pages/Scheduler.vue";
import AddTask from "./pages/AddTask.vue";
import UpdateTask from "./pages/UpdateTask.vue";
import TaskList from "./pages/TaskList.vue";
import TestPage from "./pages/TestPage.vue";

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
  {
    path: "/tasks",
    name: "TaskList",
    component: TaskList,
  },
  {
    path: "/test",
    name: "TestPage",
    component: TestPage,
  },
  {
    path: "/tasks/:id",
    name: "UpdateTask",
    component: UpdateTask,
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;