<script setup>
import { ref } from 'vue'
import AppIcon from './AppIcon.vue'
import { state, partner, partnerJoined, nameOf, sendNudge, enableNotifications } from '@/store/diary'
import { NUDGES } from '@/lib/nudges'

const open = ref(false)
const sending = ref(false)

async function send(type) {
  if (sending.value) return
  sending.value = true
  try { await sendNudge(type); open.value = false }
  catch { /* el aviso ya se mostró */ }
  finally { sending.value = false }
}
</script>

<template>
  <div class="nudge-btn">
    <button class="icon-btn" :class="{ on: open }" :aria-expanded="open" :aria-label="`Mandarle algo a ${nameOf(partner)}`" @click="open = !open">
      <AppIcon name="heart" />
    </button>

    <template v-if="open">
      <div class="backdrop" @click="open = false" />
      <div class="menu" role="menu">
        <p class="title">Mandarle a {{ nameOf(partner) }}</p>
        <p v-if="!partnerJoined" class="hint">Cuando {{ nameOf(partner) }} se una a la app podrás mandarle avisos</p>
        <template v-else>
          <button v-for="n in NUDGES" :key="n.type" role="menuitem" class="item" :disabled="sending" @click="send(n.type)">
            <span class="emoji" aria-hidden="true">{{ n.emoji }}</span>{{ n.label }}
          </button>
        </template>
        <button v-if="state.notifyPermission === 'default'" class="enable" @click="enableNotifications">
          <AppIcon name="bell" :size="18" /> Activar notificaciones en este navegador
        </button>
      </div>
    </template>
  </div>
</template>

<style scoped>
.nudge-btn { position: relative; }
.icon-btn.on, .icon-btn:hover { color: var(--ella-deep); }
.backdrop { position: fixed; inset: 0; z-index: 40; }
.menu {
  position: absolute; right: 0; top: calc(100% + 6px); z-index: 41; width: 260px;
  background: var(--paper); border-radius: 20px; padding: 10px; box-shadow: 0 20px 40px -16px rgba(74, 63, 85, .5);
  display: flex; flex-direction: column; gap: 2px;
}
.title { margin: 4px 8px 6px; font: 700 13px var(--f-ui); color: var(--muted); }
.hint { margin: 0 8px 6px; font-size: 14px; color: var(--ink-2); }
.item { display: flex; align-items: center; gap: 10px; height: 44px; padding: 0 10px; border: 0; border-radius: 12px; background: transparent; font: 600 15px var(--f-display); color: var(--ink); text-align: left; }
.item:hover:not(:disabled) { background: var(--ella-soft); }
.item .emoji { font-size: 20px; line-height: 1; }
.enable { display: flex; align-items: center; gap: 8px; margin-top: 6px; padding: 10px; border: 0; border-radius: 12px; background: var(--sand); font-size: 13px; font-weight: 700; color: var(--ink-2); text-align: left; }
</style>
