<script setup>
import { ref, onMounted, watch, onUnmounted } from "vue";
import { Chart, registerables } from "chart.js";

Chart.register(...registerables);

const chartRef = ref(null);
let chartInstance = ref(null);

// Definir props para recibir datos del padre
const props = defineProps({
  temperature: {
    type: Array,
    required: true,
  },
  isPremium: {
    type: Boolean,
    default: false,
  }
});

const labels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

 const updateChartData = () => {
  if (chartInstance.value && props.temperature && props.temperature.length > 0) {
    chartInstance.value.data.datasets[0].data = props.temperature;
    chartInstance.value.update('active');
  }
};


const initChart = () => {
  if (chartRef.value && props.temperature && props.temperature.length > 0) {
    const ctx = chartRef.value.getContext("2d");

    const gradient = ctx.createLinearGradient(0, 0, 0, 300);
    gradient.addColorStop(0, "rgba(255, 0, 0, 0.5)");
    gradient.addColorStop(0.5, "rgba(255, 255, 0, 0.3)");
    gradient.addColorStop(1, "rgba(0, 123, 255, 0.2)");

    chartInstance.value = new Chart(ctx, {
      type: "line",
      data: {
        labels,
        datasets: [
          {
            label: "Temperature (°C)",
            data: props.temperature,
            fill: true,
            backgroundColor: gradient,
            borderColor: "rgba(255, 99, 132, 1)",
            borderWidth: 2,
            tension: 0.4,
            pointRadius: 6,
            pointBackgroundColor: "rgba(255, 99, 132, 1)"
          }
        ]
      },
      options: {
        responsive: true,
        plugins: {
          legend: { display: true },
          title: { display: true, text: "Body Temperature - Last 7 Days (Premium)" }
        },
        scales: {
          x: {
            title: { display: true, text: "Day of the Week" }
          },
          y: {
            min: 35,
            max: 38,
            title: { display: true, text: "Temperature (°C)" }
          }
        }
      }
    });
  }
};

onMounted(() => {
  if (props.isPremium) {
    initChart();
  }
});

watch(() => props.temperature, () => {
  if (props.isPremium) {
    updateChartData();
  }
}, { deep: true });

</script>

<template>
  <div v-if="isPremium" class="p-4">
    <canvas ref="chartRef" height="300"></canvas>
  </div>
</template>

<style scoped>
canvas {
  max-width: 100%;
}
</style>