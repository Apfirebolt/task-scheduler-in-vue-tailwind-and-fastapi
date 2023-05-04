import { createApp } from 'vue'
import 'aos/dist/aos.css'
import './index.css'
import App from './App.vue'
import router from './routes'

createApp(App).use(router).mount('#app')
