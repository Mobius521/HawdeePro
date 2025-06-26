import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import ElementPlus from 'element-plus'
import { createPersistedState } from 'pinia-persistedstate-plugin'
import App from './App.vue'
import router from './router'
import locale from 'element-plus/dist/locale/zh-cn.js'
import 'element-plus/dist/index.css'
const app = createApp(App)
const pinia = createPinia()
const persist = createPersistedState()
pinia.use(persist)
app.use(pinia)
app.use(createPinia())
app.use(router)
app.use(ElementPlus, { locale })
app.mount('#app')
