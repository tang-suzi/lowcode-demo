import { createApp } from "vue";
import "element-plus/theme-chalk/index.css";
import * as ElementPlusIconsVue from "@element-plus/icons-vue";
import App from "./App.vue";
// import router from "./router";
// import store from "./store";

// createApp(App).use(store).use(router).mount("#app");
const app = createApp(App);
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component);
}
app.mount("#app");

/**
 * 1. 构造假数据，实现根据位置渲染内容
 * 2. 配置组件的映射关系
 */
