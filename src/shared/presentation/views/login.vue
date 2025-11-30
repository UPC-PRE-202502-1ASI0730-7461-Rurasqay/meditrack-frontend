<script setup>
import LoginForm from "../../../iam/presentation/components/login-form.vue";
</script>

<template>
  <div class="login-container">
    <login-form/>
  </div>
</template>

<style scoped>
.login-container {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: #2563eb;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 1rem;
  overflow-y: auto;
}
</style>