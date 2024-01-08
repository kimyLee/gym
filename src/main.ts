import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import Antd from 'ant-design-vue'
import 'ant-design-vue/dist/antd.css'
import '@/style/common.scss'

import NoSleep from 'nosleep.js' // 连接蓝牙时候，电脑可能休眠导致断连

const noSleep = new NoSleep()

document.addEventListener('click', function enableNoSleep () {
  document.removeEventListener('click', enableNoSleep, false)
  noSleep.enable()
}, false)

const app = createApp(App).use(store).use(router).use(Antd)

app.mount('#app')
