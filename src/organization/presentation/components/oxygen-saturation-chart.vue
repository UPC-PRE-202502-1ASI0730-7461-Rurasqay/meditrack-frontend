<script setup>
import { ref, onMounted, watch, onUnmounted, toRaw } from "vue";
import { Chart, registerables } from "chart.js";

Chart.register(...registerables);

const chartRef = ref(null);
let chartInstance = ref(null);
const isUnmounting = ref(false);

const props = defineProps({
  oxygenLevel: {
    type: Array,
    required: true,
  }
});

const labels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const updateChartData = () => {
  if (isUnmounting.value) return;
  if (chartInstance.value && props.oxygenLevel) {
    try {
      const rawData = toRaw(props.oxygenLevel);
      const data = JSON.parse(JSON.stringify(rawData)).map(d => d.ox || d);
      chartInstance.value.data.datasets[0].data = data;
      chartInstance.value.update('active');
    } catch (error) {
      console.error('Error updating chart:', error);
    }
  }
};

const initChart = () => {
  if (chartRef.value && props.oxygenLevel) {
    const ctx = chartRef.value.getContext("2d");
    const rawData = toRaw(props.oxygenLevel);
    const data = JSON.parse(JSON.stringify(rawData)).map(d => d.ox || d);
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

onUnmounted(() => {
  isUnmounting.value = true;
  if (chartInstance.value) {
    try {
      chartInstance.value.destroy();
    } catch (error) {
      console.error('Error destroying chart:', error);
    }
    chartInstance.value = null;
  }
});

watch(() => props.oxygenLevel, () => {
  if (!isUnmounting.value) {
    updateChartData();
  }
}, { deep: true });

</script>

<template>
  <div class="chart-container">
    <canvas ref="chartRef" height="300"></canvas>
  </div>
</template>

<style scoped>
.chart-container {
  padding: 1rem;
  width: 100%;
}

canvas {
  max-width: 100%;
}
</style>
