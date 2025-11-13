<script setup>
import { computed } from 'vue';
import {useI18n} from "vue-i18n";

const { t, locale, availableLocales } = useI18n();
const localeOptions = computed(() => availableLocales.map(lang => ({
  label: t(`languages.${lang}`),
  value: lang
})));
</script>

<template>
  <pv-select-button
    v-model="locale"
    :options="localeOptions"
    option-label="label"
    option-value="value"
    aria-labelledby="basic"
  />
</template>

<style scoped>

</style>