import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import ElementPlus from 'element-plus'

import App from './App.vue'
import router from './router'
import 'element-plus/dist/index.css'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import Header from './components/Header.vue'
import Aside from './components/Aside.vue'

import Echarts from "vue-echarts"
import * as echarts from "echarts"


const app = createApp(App)

for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
}
app.use(createPinia())
app.use(router)
app.use(ElementPlus)

//全局注册Echarts
app.component("v-chart", Echarts)
app.config.globalProperties.$echarts = echarts

// 全局注册 Header 组件
app.component('global-header', Header)

// 全局注册 Aside 组件
app.component('global-aside', Aside)

app.mount('#app')
