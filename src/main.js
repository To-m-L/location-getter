import { createApp } from 'vue'
import App from './App.vue'
import { createVuetify } from 'vuetify';
import 'vuetify/dist/vuetify.css'

const app = createApp(App);

const vuetify = createVuetify();

app.use(vuetify);

app.mount('#app');
