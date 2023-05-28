import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'
import { vLongPress } from './directives/longPress'

import './assets/main.css'

const app = createApp(App)

app.use(createPinia())
app.use(router)

app.directive('long-press', vLongPress)

app.mount('#app')
