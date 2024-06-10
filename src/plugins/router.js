import { createMemoryHistory, createRouter } from 'vue-router'
import OptionTable from "/src/components/OptionTable.vue";
import OptionCalculator from "/src/components/OptionCalculator.vue";
import Reference from "/src/components/Reference.vue";

const routes = [
  { path: '/', component: OptionTable },
  { path: '/strategy/:strategy', component: OptionTable },
  { path: '/option_calculator', component: OptionCalculator },
  { path: '/reference', component: Reference },
]

const router = createRouter({
  history: createMemoryHistory(),
  routes,
})

export default router
