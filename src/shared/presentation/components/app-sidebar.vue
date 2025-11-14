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
  // Opciones para Admin Clínica: DoctorList, PatientsList, Support
  // Opciones para Doctors y Cuidadores: ListPatients, Support
  { name: "Doctor List", icon: "/src/assets/doctor.png", roles: ["admin-clinica"] },
  { name: "Patients List", icon: "/src/assets/list.png", roles: ["admin-clinica", "admin-casa-reposo", "doctors", "cuidadores"] },
  { name: "Support", icon: "/src/assets/support.png", roles: ["admin-clinica", "admin-casa-reposo", "doctors", "cuidadores", "allegado-premium"] },

  // Opciones para Admin Casa de Reposo: CuidadorList, PatientsList, Support
  { name: "Cuidador List", icon: "/src/assets/nurse.png", roles: ["admin-casa-reposo"] },

  // Opciones para Patient Selected, Allegado Premium y Freemium: Senior Citizen, Stats, Alerts
  { name: "Senior Citizen", icon: "/src/assets/senior.png", roles: ["patient-selected", "allegado-premium", "allegado-freemium"] },
  { name: "Stats", icon: "/src/assets/stats.png", roles: ["patient-selected", "allegado-premium", "allegado-freemium"] },
  { name: "Alerts", icon: "/src/assets/notification.png", roles: ["patient-selected", "allegado-premium", "allegado-freemium"] },
];

// 2. **Rol del Usuario (Variable Clave):**
const userRole = ref('admin-clinica'); // <-- **AJUSTA ESTE ROL PARA PROBAR**

// Estado para el item seleccionado
const selectedItem = ref(null);

// Función para seleccionar un item
const selectItem = (itemName) => {
  selectedItem.value = itemName;
  console.log(`Item seleccionado: ${itemName}`);
}

// 3. **Lógica de Filtrado (Propiedad Computada):**
const filteredOptions = computed(() => {
  return menuOptions.filter(option =>
      option.roles.includes(userRole.value)
  );
});

const toggleRole = () => {
  const roles = ['admin-clinica', 'admin-casa-reposo', 'doctors', 'cuidadores', 'patient-selected', 'allegado-premium', 'allegado-freemium'];
  const currentIndex = roles.indexOf(userRole.value);
  const nextIndex = (currentIndex + 1) % roles.length;
  userRole.value = roles[nextIndex];
  console.log(`Rol cambiado a: ${userRole.value}`);
}
</script>

<template>
  <pv-drawer :visible="props.visible" >
    <template #container="{ closeCallback }" class="sidebar-container">
      <span>
        <pv-button type="button" @click="closeSidebar" icon="pi pi-times" rounded severity="contrast" variant="outlined" ></pv-button>
      </span>
      <nav class="sidebar-menu">
        <div
            v-for="option in filteredOptions"
            :key="option.name"
            class="menu-item"
            @click="selectItem(option.name)"
            :class="{ 'selected': selectedItem === option.name }"
        >
          <img :src="option.icon" :alt="option.name" class="icon-image" />
          <span class="text">{{ option.name }}</span>
        </div>
      </nav>

      <button @click="toggleRole" class="role-switcher">
        Cambiar Rol (Actual: {{ userRole.toUpperCase().replace('-', ' ') }})
      </button>

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