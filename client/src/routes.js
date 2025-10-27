import { createWebHistory, createRouter } from "vue-router";
import Home from "./pages/Home.vue"
import Scheduler from "./pages/Scheduler.vue";
import Login from "./pages/Login.vue";
import Register from "./pages/Register.vue";
import AddTask from "./pages/AddTask.vue";
import UpdateTask from "./pages/UpdateTask.vue";
import TaskList from "./pages/TaskList.vue";
import TaskTable from "./pages/TaskTable.vue";
import Scroll from "./pages/Scroll.vue";

const routes = [
  {
    path: "/",
    name: "Home",
    component: Home,
  },
  {
    path: "/login",
    name: "Login",
    component: Login,
  },
  {
    path: "/register",
    name: "Register",
    component: Register,
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
    path: "/task-table",
    name: "TaskTable",
    component: TaskTable,
  },
  {
    path: "/tasks/:id",
    name: "UpdateTask",
    component: UpdateTask,
  },
  {
    path: "/scroll",
    name: "Scroll",
    component: Scroll,
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;