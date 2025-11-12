<script setup>
import AppHeader from "./app-header.vue";
import { useRoute } from "vue-router";
import { computed } from "vue";

const route = useRoute();

// Hide header on login page
const showHeader = computed(() => route.name !== 'login');
</script>

<template>
  <app-header v-if="showHeader"></app-header>
  <router-view/>
</template>

<style scoped>

</style>