<script setup lang="ts">
import { computed, ref } from "vue";
import { routes } from "./router/routes";
import StatusBadge from "./components/common/StatusBadge.vue";
import StatCard from "./components/common/StatCard.vue";
import WarehousesPage from "./pages/WarehousesPage.vue";
import DispatchPage from "./pages/DispatchPage.vue";
import SheltersPage from "./pages/SheltersPage.vue";
import EventsPage from "./pages/EventsPage.vue";
import DashboardPage from "./pages/DashboardPage.vue";

const active = ref<string>(routes[0]?.route ?? "/dashboard");
const current = computed(() => routes.find((route) => route.route === active.value) ?? routes[0]);
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
        <StatusBadge value="LOCAL_DATA" />
      </section>

      <WarehousesPage v-if="active === '/warehouses'" />
      <DispatchPage v-else-if="active === '/dispatch'" />
      <SheltersPage v-else-if="active === '/shelters'" />
      <EventsPage v-else-if="active === '/events'" />
      <template v-else>
        <section class="metrics">
          <StatCard label="应急仓库" :value="3" />
          <StatCard label="库存批次" :value="8" />
          <StatCard label="移库单" :value="1" />
        </section>
        <DashboardPage />
      </template>
    </main>
  </div>
</template>
