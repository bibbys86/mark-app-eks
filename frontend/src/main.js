import './assets/main.css'

import { createApp } from 'vue'
import App from './App.vue'
import router from './router'

// RUM 초기화는 nginx-proxy에서 처리됨
// 중복 초기화 방지를 위해 제거

const app = createApp(App)
app.use(router)
app.mount('#app')
