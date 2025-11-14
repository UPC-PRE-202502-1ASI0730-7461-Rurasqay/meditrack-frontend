<script setup>
import AppHeader from "./app-header.vue";
import { useRoute } from "vue-router";
import { computed } from "vue";

const route = useRoute();
</script>

<template>
  <router-view/>
</template>

<style scoped>

</style>