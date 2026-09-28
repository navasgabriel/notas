<script setup>
import { useRoute } from 'vue-router'
import AppShell from './components/AppShell.vue'
import { state } from './store/diary'

const route = useRoute()
</script>

<template>
  <RouterView v-if="route.meta.public" />
  <AppShell v-else>
    <RouterView />
  </AppShell>

  <Transition name="toast">
    <div v-if="state.toast" class="toast" role="status">{{ state.toast }}</div>
  </Transition>
</template>

<style>
.toast {
  position: fixed; left: 50%; bottom: calc(110px + env(safe-area-inset-bottom)); transform: translateX(-50%); z-index: 100;
  background: var(--ink); color: #fff; padding: 12px 18px; border-radius: 16px; font-weight: 700; font-size: 14px;
  box-shadow: 0 14px 30px -12px rgba(40, 25, 45, .6); max-width: calc(100vw - 32px); text-align: center;
}
@media (min-width: 1024px) { .toast { bottom: 32px; } }
.toast-enter-active, .toast-leave-active { transition: opacity .25s, transform .25s; }
.toast-enter-from, .toast-leave-to { opacity: 0; transform: translate(-50%, 12px); }
</style>
