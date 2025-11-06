import { createWebHistory, createRouter } from "vue-router";
import Home from "./pages/Home.vue";
import Scheduler from "./pages/Scheduler.vue";
import Login from "./pages/Login.vue";
import Register from "./pages/Register.vue";
import AddTask from "./pages/AddTask.vue";
import UpdateTask from "./pages/UpdateTask.vue";
import Profile from "./pages/Profile.vue";
import TaskList from "./pages/TaskList.vue";
import TaskTable from "./pages/TaskTable.vue";
import Scroll from "./pages/Scroll.vue";
import Cookie from "js-cookie";

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
    path: "/profile",
    name: "Profile",
    component: Profile,
    meta: { requiresAuth: true },
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

// Navigation guard to protect routes
router.beforeEach((to, from, next) => {
  const isAuthenticated = Cookie.get("user") ? true : false;

  if (to.meta.requiresAuth && !isAuthenticated) {
    next("/login");
  } else {
    next();
  }
});

export default router;
