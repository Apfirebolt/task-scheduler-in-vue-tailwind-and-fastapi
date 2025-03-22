import { createApp } from "vue";
import "aos/dist/aos.css";
import "animate.css";
import "./index.css";
import App from "./App.vue";
import router from "./routes";

const app = createApp(App);
app.config.globalProperties.$user = {
    name: "John Doe",
    email: "john@gmail.com"
}
app.use(router);
app.mount("#app");

