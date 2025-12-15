import "./assets/main.css";

import { createApp } from "vue";
import { createPinia } from "pinia";
import App from "./App.vue";
import { useAuthStore } from "./features/auth/store/useAuthStore";
import { router } from "./router";

const app = createApp(App);
const pinia = createPinia();

app.use(pinia);

// Inicializa sessão atual antes de registrar o router
const authStore = useAuthStore(pinia);
await authStore.init();

app.use(router);
app.mount("#app");
