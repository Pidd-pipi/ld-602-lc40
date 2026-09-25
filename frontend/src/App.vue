<script setup lang="ts">
import { computed, ref } from "vue";
import { routes } from "./router/routes";
import StatusBadge from "./components/common/StatusBadge.vue";
import StatCard from "./components/common/StatCard.vue";
import DashboardPage from "./pages/DashboardPage.vue";
import WarehousesPage from "./pages/WarehousesPage.vue";
import SheltersPage from "./pages/SheltersPage.vue";
import DispatchPage from "./pages/DispatchPage.vue";
import EventsPage from "./pages/EventsPage.vue";

const pageComponents: Record<string, unknown> = {
  "/dashboard": DashboardPage,
  "/warehouses": WarehousesPage,
  "/shelters": SheltersPage,
  "/dispatch": DispatchPage,
  "/events": EventsPage
};

const active = ref<string>(routes[0]?.route ?? "/dashboard");
const current = computed(() => routes.find((route) => route.route === active.value) ?? routes[0]);
const currentComponent = computed(() => pageComponents[active.value] ?? DashboardPage);
</script>

<template>
  <div class="shell">
    <aside>
      <div class="brand">城市防灾应急物资调度系统</div>
      <nav>
        <button v-for="route in routes" :key="route.route" :class="{ active: active === route.route }" @click="active = route.route">{{ route.name }}</button>
      </nav>
    </aside>
    <main class="page">
      <section class="page-head">
        <div><p class="eyebrow">rescue-stock</p><h1>{{ current?.name }}</h1></div>
        <StatusBadge value="LOCAL_DATA" text="本地数据模式" />
      </section>
      <component :is="currentComponent" v-if="active !== '/dashboard'" />
      <template v-else>
        <section class="metrics">
          <StatCard label="核心模型" :value="5" />
          <StatCard label="共享枚举" :value="4" />
          <StatCard label="业务页面" :value="routes.length" />
        </section>
        <DashboardPage />
      </template>
    </main>
  </div>
</template>
