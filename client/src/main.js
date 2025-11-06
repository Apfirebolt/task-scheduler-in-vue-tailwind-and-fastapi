import { createApp } from "vue";
import "aos/dist/aos.css";
import store from './store';
import "animate.css";
import "./index.css";
import App from "./App.vue";
import router from "./routes";
import * as authTypes from './store/modules/auth/authTypes';

const app = createApp(App);

app.use(router);
app.use(store);

store.dispatch(authTypes.CHECK_USER_AUTHENTICATION).then(() => {
    console.log("User authentication checked.");
    app.mount("#app");
});