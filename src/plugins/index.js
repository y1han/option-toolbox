/**
 * plugins/index.js
 *
 * Automatically included in `./src/main.js`
 */

// Plugins
import router from './router.js'
import VueLatex from 'vatex'
import Antd from 'ant-design-vue';
import 'ant-design-vue/dist/reset.css';

export function registerPlugins (app) {
  app.use(Antd)
  app.use(router);
  app.use(VueLatex);
}
