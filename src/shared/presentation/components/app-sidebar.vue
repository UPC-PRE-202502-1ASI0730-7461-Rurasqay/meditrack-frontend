<script setup lang="ts">
import LanguageSwitcher from "./language-switcher.vue";
import { useRoute } from "vue-router";
import {computed} from "vue";

const route = useRoute();

// Define props and emits for v-model
const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['update:visible']);

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

const closeDrawer = () => {
  emit('update:visible', false);
}
</script>

<template>
  <pv-drawer 
    :visible="visible" 
    @update:visible="emit('update:visible', $event)"
    position="left"
    class="sidebar-drawer"
  >
    <template #header>
      <h2 class="logo">MediTrack</h2>
    </template>

    <nav class="menu">
      <RouterLink
          v-for="item in menuItems"
          :key="item.path"
          :to="item.path"
          class="menu-item"
          active-class="active"
          @click="closeDrawer"
      >
        <i :class="item.icon"></i>
        <span>{{ item.label }}</span>
      </RouterLink>
    </nav>

    <div class="sidebar-footer">
      <LanguageSwitcher />
    </div>
  </pv-drawer>
</template>

<style scoped>
.logo {
  font-size: 1.5rem;
  font-weight: bold;
  color: #1976d2;
  margin: 0;
}

.menu {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  padding: 1rem 0;
}

.menu-item {
  display: flex;
  align-items: center;
  padding: 12px 20px;
  cursor: pointer;
  color: #666;
  text-decoration: none;
  transition: all 0.2s;
  border-radius: 4px;
  gap: 0.75rem;
}

.menu-item:hover {
  background-color: #f5f5f5;
  color: #1976d2;
}

.menu-item.active {
  background-color: #e3f2fd;
  color: #1976d2;
  font-weight: 600;
}

.menu-item i {
  font-size: 1.2rem;
}

.sidebar-footer {
  margin-top: auto;
  padding-top: 1rem;
  border-top: 1px solid #e0e0e0;
}
</style>