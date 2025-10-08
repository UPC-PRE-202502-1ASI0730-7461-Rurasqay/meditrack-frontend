<script setup>
import { onMounted, ref, watch, onUnmounted } from "vue";
import { Chart, registerables } from "chart.js";

Chart.register(...registerables);

const chartRef = ref(null);
let chartInstance = ref(null);

const props = defineProps({
  heartRate: {
    type: Array,
    required: true,
  }
});

const labels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];


const updateChartData = () => {
  if (chartInstance.value && props.heartRate) {
    chartInstance.value.data.datasets[0].data = props.heartRate;
    chartInstance.value.update('active');
  }
};


const initChart = () => {
  if (chartRef.value && props.heartRate) {
    const ctx = chartRef.value.getContext("2d");

    chartInstance.value = new Chart(ctx, {
      type: "line",
      data: {
        labels,
        datasets: [
          {
            label: "Heart Rate (bpm)",
            data: props.heartRate,
            borderColor: "rgb(226,99,255)",
            backgroundColor: "rgba(255, 99, 132, 0.2)",
            tension: 0.3,
            fill: true,
            yAxisID: "y",
          }
        ]
      },
      options: {
        responsive: true,
        interaction: {
          mode: "index",
          intersect: false
        },
        plugins: {
          legend: { position: "top" },
          title: {
            display: true,
            text: "Heart Rate - Last 7 Days"
          }
        },
        scales: {
          y: {
            type: "linear",
            display: true,
            position: "left",
            suggestedMin: 60,
            suggestedMax: 100,
            title: {
              display: true,
              text: "BPM"
            }
          }
        }
      }
    });
  }
};

onMounted(() => {
  initChart();
});

watch(() => props.heartRate, () => {
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