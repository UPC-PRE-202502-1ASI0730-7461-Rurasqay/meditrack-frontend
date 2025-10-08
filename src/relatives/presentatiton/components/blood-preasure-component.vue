<script setup>
import { onMounted, onBeforeUnmount, ref, watch, toRaw } from "vue";
import { Chart, BarController, BarElement, CategoryScale, LinearScale, Tooltip, Legend } from 'chart.js';

Chart.register(BarController, BarElement, CategoryScale, LinearScale, Tooltip, Legend);

const chartRef = ref(null);
const chartInstance = ref(null);
const isUnmounting = ref(false);

const props = defineProps({
  bloodPressure: {
    type: Array,
    required: true,
  }
});

const labels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const updateChartData = () => {
  if (isUnmounting.value) return;
  if (chartInstance.value && props.bloodPressure) {
    try {
      const plainData = JSON.parse(JSON.stringify(toRaw(props.bloodPressure)));
      chartInstance.value.data.datasets[0].data = plainData;
      chartInstance.value.update();
    } catch (error) {
      console.error('Error updating chart:', error);
    }
  }
};

const initChart = () => {
  if (chartRef.value && props.bloodPressure) {
    if (chartInstance.value) {
      chartInstance.value.destroy();
    }

    const plainData = JSON.parse(JSON.stringify(toRaw(props.bloodPressure)));
    const ctx = chartRef.value.getContext("2d");
    chartInstance.value = new Chart(ctx, {
      type: "bar",
      data: {
        labels,
        datasets: [
          {
            label: "Blood Pressure (mmHg)",
            data: plainData,
            backgroundColor: "rgba(255, 99, 132, 0.6)",
            borderColor: "rgba(255, 99, 132, 1)",
            borderWidth: 1
          }
        ]
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            position: "top"
          },
          title: {
            display: true,
            text: "Blood Pressure (Diastolic & Systolic) - Last 7 Days"
          },
          tooltip: {
            callbacks: {
              label: function(context) {
                const [diastolic, systolic] = context.raw;
                return `Diastolic: ${diastolic}, Systolic: ${systolic}`;
              }
            }
          }
        },
        scales: {
          y: {
            beginAtZero: false,
            suggestedMin: 60,
            suggestedMax: 140,
            title: { display: true, text: "mmHg"}
          }
        }
      }
    });
  }
};

onMounted(() => {
  initChart();
});

onBeforeUnmount(() => {
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

watch(() => props.bloodPressure, () => {
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
</style>