import { createApp } from 'vue'
import App from './App.vue'
import { router } from './router'
import { load } from './store/diary'
import './styles/base.css'

load().then(() => createApp(App).use(router).mount('#app'))
