import { createApp } from 'vue'
import { createPinia } from 'pinia'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import zhCn from 'element-plus/dist/locale/zh-cn.mjs'

import App from './App.vue'
import router from './router'
import { useUserStore } from '@/stores/user'
import { useAppStore } from '@/stores/app'
import '@/assets/main.css'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)

// 初始化状态
const userStore = useUserStore()
const appStore = useAppStore()

userStore.initUserInfo()
appStore.initApp()

// 注册所有图标
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
    app.component(key, component)
}

app.use(router)
app.use(ElementPlus, {
    locale: zhCn,
})

app.mount('#app')