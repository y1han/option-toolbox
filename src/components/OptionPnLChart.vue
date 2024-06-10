<template>
  <v-chart autoresize class="chart"/>
</template>

<script setup>
import { use } from "echarts/core";
import { CanvasRenderer } from "echarts/renderers";
import { LineChart } from "echarts/charts";
import {
  TitleComponent,
  TooltipComponent,
  ToolboxComponent,
  DatasetComponent,
  VisualMapComponent,
  GridComponent,
  DataZoomComponent
} from "echarts/components";
import VChart, { THEME_KEY } from "vue-echarts";
import { provide } from "vue";

use([
  TitleComponent,
  TooltipComponent,
  ToolboxComponent,
  GridComponent,
  DatasetComponent,
  VisualMapComponent,
  LineChart,
  CanvasRenderer,
  DataZoomComponent
])

provide(THEME_KEY, "light");
</script>

<style scoped>
.chart {
  height: 400px;
}
</style>
