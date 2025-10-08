<script setup>
import {useI18n} from "vue-i18n";

const { t, locale, availableLocales } = useI18n();
const localeOptions = availableLocales.map(l => l.toUpperCase());
</script>

<template>
  <pv-select-button v-model="locale" :options="localeOptions"/>
</template>

<style scoped>

</style>