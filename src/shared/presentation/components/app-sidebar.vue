<script setup lang="ts">
import LanguageSwitcher from "./language-switcher.vue";
import { ref, computed } from "vue";

// Definir props y emits
const props = defineProps<{
  visible: boolean;
}>();

const emit = defineEmits<{
  'update:visible': [value: boolean];
}>();

// Función para cerrar el sidebar
const closeSidebar = () => {
  emit('update:visible', false);
};

// 1. **Definición de Roles y Opciones:**
const menuOptions = [
  { name: "Doctor List", icon: "👨‍⚕️", roles: ["admin"] },
  { name: "Patient List", icon: "🏥", roles: ["admin", "doctor"] },
  { name: "Support", icon: "❓", roles: ["admin", "doctor"] },
  { name: "Settings", icon: "⚙️", roles: ["admin"] },
];

// 2. **Rol del Usuario (Variable Clave):**
const userRole = ref('admin');

// 3. **Lógica de Filtrado (Propiedad Computada):**
const filteredOptions = computed(() => {
  return menuOptions.filter(option =>
      option.roles.includes(userRole.value)
  );
});

const toggleRole = () => {
  userRole.value = userRole.value === 'admin' ? 'doctor' : 'admin';
  console.log(`Rol cambiado a: ${userRole.value}`);
}
</script>

<template>
  <pv-drawer :visible="props.visible" >
    <template #container="{ closeCallback }" class="sidebar-container">
      <span>
        <pv-button type="button" @click="closeSidebar" icon="pi pi-times" rounded variant="outlined"></pv-button>
      </span>
      <nav class="sidebar-menu">
        <div
            v-for="option in filteredOptions"
            :key="option.name"
            class="menu-item"
        >
          <span class="icon">{{ option.icon }}</span>
          <span class="text">{{ option.name }}</span>
        </div>
      </nav>

      <!--<button @click="toggleRole" class="role-switcher">
        Cambiar Rol (Actual: {{ userRole.toUpperCase() }})
      </button>
      */-->

      <div class="language-switcher-wrapper">
        <language-switcher></language-switcher>
      </div>
    </template>
  </pv-drawer>
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
  transition: background-color 0.2s;
}

.menu-item:hover {
  background-color: #34495e; /* Un tono un poco más claro al pasar el mouse */
}

.icon {
  font-size: 1.2em;
  margin-right: 15px;
}

.text {
  font-weight: 500;
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
  background-color: #1abc9c; /* Un color de acento */
  color: white;
  border: none;
  cursor: pointer;
  font-weight: bold;
}
</style>