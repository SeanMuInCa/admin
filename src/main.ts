import { createApp } from 'vue';
//引入element插件和样式

import ElementPlus from 'element-plus';
import 'element-plus/dist/index.css';

import App from '@/App.vue';
//svg插件所需
import 'virtual:svg-icons-register';
//引入仓库
import pinia from '@/store';
import globaleComponent from '@/components/index.ts';
import { router } from '@/router/index';
import '@/styles/index.scss';
import '@/permission';
import 'element-plus/theme-chalk/dark/css-vars.css';
const app = createApp(App);
app.use(ElementPlus);
app.use(globaleComponent);

app.use(router);
app.use(pinia);
//引入自定义指令,判断按钮是否应该显示
import { hasButtons } from './directive/orders';
hasButtons(app);
app.mount('#app');
