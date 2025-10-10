<script setup>
import { onMounted, ref, watch, onUnmounted, toRaw } from "vue";
import { Chart, registerables } from "chart.js";

Chart.register(...registerables);

const chartRef = ref(null);
let chartInstance = ref(null);
const isUnmounting = ref(false);

const props = defineProps({
  heartRate: {
    type: Array,
    required: true,
  }
});

const labels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];


const updateChartData = () => {
  if (isUnmounting.value) return; // Don't update if unmounting
  if (chartInstance.value && props.heartRate) {
    try {
      // Convert Vue Proxy to plain array
      const plainData = JSON.parse(JSON.stringify(toRaw(props.heartRate)));
      chartInstance.value.data.datasets[0].data = plainData;
      chartInstance.value.update('active');
    } catch (error) {
      console.error('Error updating chart:', error);
    }
  }
};


const initChart = () => {
  if (chartRef.value && props.heartRate) {
    const plainData = JSON.parse(JSON.stringify(toRaw(props.heartRate)));
    const ctx = chartRef.value.getContext("2d");
    chartInstance.value = new Chart(ctx, {
      type: "line",
      data: {
        labels,
        datasets: [
          {
            label: "Heart Rate (bpm)",
            data: plainData,
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

watch(() => props.heartRate, () => {
  if (!isUnmounting.value) {
    updateChartData();
  }
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