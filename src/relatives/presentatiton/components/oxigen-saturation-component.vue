<script setup>
import { ref, onMounted, watch, onUnmounted } from "vue";
import { Chart, registerables } from "chart.js";

Chart.register(...registerables);

const chartRef = ref(null);
let chartInstance = ref(null);

const props = defineProps({
  oxygenLevel: {
    type: Array,
    required: true,
  }
});

const labels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const updateChartData = () => {
  if (chartInstance.value && props.oxygenLevel) {
    const data = props.oxygenLevel.map(d => d.ox);
    chartInstance.value.data.datasets[0].data = data;
    chartInstance.value.update('active');
  }
};

const initChart = () => {
  if (chartRef.value && props.oxygenLevel) {
    const ctx = chartRef.value.getContext("2d");

    const data = props.oxygenLevel.map(d => d.ox);

    chartInstance.value = new Chart(ctx, {
      type: "line",
      data: {
        labels,
        datasets: [
          {
            label: "SpO2",
            borderColor: "rgb(99,255,135)",
            borderWidth: 2,
            radius: 3,
            data: data,
          },
        ]
      },
      options: {
        responsive: true,
        plugins: {
          legend: { display: true },
          title: { display: true, text: "Oxygen Saturation (%) - Last 7 Days" }
        },
        scales: {
          x: {
            title: { display: true, text: "Day of the Week" }
          },
          y: {
            min: 90,
            max: 100,
            title: { display: true, text: "SpO₂ (%)" }
          }
        }
      }
    });
  }
};

onMounted(() => {
  initChart();
});

watch(() => props.oxygenLevel, () => {
  updateChartData();
}, { deep: true });


</script>

<template>
  <div class="p-4">
    <canvas ref="chartRef" height="300"></canvas>
  </div>
</template>

<style scoped>
canvas {
  max-width: 100%;
}
</style>