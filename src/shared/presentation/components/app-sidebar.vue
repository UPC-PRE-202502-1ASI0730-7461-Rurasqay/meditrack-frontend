<script setup lang="ts">
import LanguageSwitcher from "./language-switcher.vue";
import { useRoute } from "vue-router";
import {computed} from "vue";

const route = useRoute();

const relativeId = computed(() => route.params.id);

const menuItems = computed(() => [
  {
    label: "Alerts",
    path: `/relative/${relativeId.value}/alerts`,
    icon: "pi pi-bell",
  },
  {
    label: "Profile",
    path: `/relative/${relativeId.value}/profile`,
    icon: "pi pi-user",
  },
  {
    label: "Statistics",
    path: `/relative/${relativeId.value}/statistics`,
    icon: "pi pi-chart-bar",
  },
  {
    label: "Support",
    path: `/relative/${relativeId.value}/support`,
    icon: "pi pi-question-circle",
  },
])
</script>

<template>
  <aside class="sidebar">
    <div class="sidebar-header">
      <h2 class="logo">MediTrack</h2>
    </div>

    <nav class="menu">
      <RouterLink
          v-for="item in menuItems"
          :key="item.path"
          :to="item.path"
          class="menu-item"
          active-class="active"
      >
        <i :class="item.icon"></i>
        <span>{{ item.label }}</span>
      </RouterLink>
    </nav>

    <div class="sidebar-footer">
      <LanguageSwitcher />
    </div>
  </aside>
</template>

<style scoped>
/* Estilos generales del contenedor del sidebar */
.sidebar-container {
  width: 180px;
  height: 100vh;
  background-color: #2c3e50; /* Color de fondo oscuro (Navy/Azul oscuro) */
  color: white;
  padding-top: 20px;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
}

/* Estilos de la lista de opciones */
.sidebar-menu {
  display: flex;
  flex-direction: column;
  flex-grow: 1; /* Permite que el menú ocupe el espacio restante */
}

/* Estilos de cada opción del menú */
.menu-item {
  display: flex;
  align-items: center;
  padding: 12px 20px;
  cursor: pointer;
  background-color: white; /* Fondo blanco siempre */
  transition: all 0.2s;
  margin: 2px 8px; /* Pequeño margen para separar del borde */
  border-radius: 4px; /* Bordes redondeados */
}

.menu-item:hover {
  background-color: #f5f5f5; /* Un gris muy claro al pasar el mouse */
}

.menu-item.selected {
  background-color: white; /* Mantener fondo blanco cuando está seleccionado */
}

.icon {
  font-size: 1.2em;
  margin-right: 15px;
}

.icon-image {
  width: 24px;
  height: 24px;
  margin-right: 15px;
  filter: brightness(0) saturate(100%) invert(50%) sepia(0%) saturate(0%) hue-rotate(0deg) brightness(100%) contrast(100%); /* Gris por defecto */
  object-fit: contain;
  transition: filter 0.2s ease;
}

/* Estilos para cuando el item está seleccionado */
.menu-item.selected .icon-image {
  filter: brightness(0) saturate(100%) invert(27%) sepia(51%) saturate(2878%) hue-rotate(200deg) brightness(104%) contrast(97%); /* Color #1976d2 */
}

.menu-item.selected .text {
  color: #1976d2; /* Texto azul cuando está seleccionado */
}

.text {
  font-weight: 500;
  color: #666; /* Texto gris por defecto */
  transition: color 0.2s ease;
}

/* Estilo para el switch de idioma y el botón de prueba */
.language-switcher-wrapper, .role-switcher {
  padding: 20px;
  margin-top: auto; /* Empuja estos elementos hacia la parte inferior */
  border-top: 1px solid #34495e;
}

.role-switcher {
  width: 100%;
  padding: 10px;
  background-color: #1976d2; /* Un color de acento */
  color: white;
  border: none;
  cursor: pointer;
  font-weight: bold;
}

</style>