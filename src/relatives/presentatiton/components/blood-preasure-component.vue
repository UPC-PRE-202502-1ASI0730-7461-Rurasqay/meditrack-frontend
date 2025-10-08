<script setup>
import { onMounted, ref, watch } from "vue";
import { Chart, BarController, BarElement, CategoryScale, LinearScale, Tooltip, Legend } from 'chart.js';

Chart.register(BarController, BarElement, CategoryScale, LinearScale, Tooltip, Legend);

const chartRef = ref(null);
const chartInstance = ref(null);

const props = defineProps({
  bloodPressure: {
    type: Array,
    required: true,
  }
});

const labels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const updateChartData = () => {
  if (chartInstance.value && props.bloodPressure) {
    chartInstance.value.data.datasets[0].data = props.bloodPressure;
    chartInstance.value.update();
  }
};

const initChart = () => {
  if (chartRef.value && props.bloodPressure) {
    if (chartInstance.value) {
      chartInstance.value.destroy();
    }

    const ctx = chartRef.value.getContext("2d");
    chartInstance.value = new Chart(ctx, {
      type: "bar",
      data: {
        labels,
        datasets: [
          {
            label: "Blood Pressure (mmHg)",
            data: props.bloodPressure,
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

watch(() => props.bloodPressure, () => {
  updateChartData()
}, { deep: true });

</script>

<template>
  <div class="p-4">
    <canvas ref="chartRef" height="300"></canvas>
  </div>
</template>

<style scoped>
</style>