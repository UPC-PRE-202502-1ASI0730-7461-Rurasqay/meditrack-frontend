<script setup>
</script>

<template>
  <div class="p-4">
    <pv-card>
      <template #title>
        <div class="flex align-items-center">
          <i class="pi pi-headphones mr-2"></i>
          <span>Support</span>
        </div>
      </template>
      <template #content>
        <p>If you need help, please contact our support team.</p>
        <ul>
          <li><strong>Email:</strong> support@meditrack.com</li>
          <li><strong>Phone:</strong> +1 (234) 567-890</li>
        </ul>
        <p>Our team is available 24/7 to assist you with any questions or issues you may have.</p>
      </template>
    </pv-card>
  </div>
</template>

<style scoped>
ul {
  list-style-type: none;
  padding: 0;
}
li {
  margin-bottom: 0.5rem;
}
</style>