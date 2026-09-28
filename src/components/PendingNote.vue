<script setup>
import { computed } from 'vue'
import AppIcon from './AppIcon.vue'
import { me, nameOf, showToast } from '@/store/diary'
import { todayKey } from '@/lib/dates'

const props = defineProps({ dayKey: String, who: String })
const emit = defineEmits(['write'])

const mine = computed(() => props.who === me.value)
const isToday = computed(() => props.dayKey === todayKey())

function remind() {
  // Prototipo: aquí irá la notificación real cuando exista backend.
  showToast(`Le mandamos un corazón a ${nameOf(props.who)} para que escriba`)
}
</script>

<template>
  <div class="pending" :class="who">
    <svg viewBox="0 0 120 90" width="110" height="82" aria-hidden="true">
      <rect x="14" y="22" width="92" height="60" rx="10" :fill="who === 'ella' ? '#FDE6EC' : '#E2EFFA'" :stroke="who === 'ella' ? '#E07E98' : '#5E9DD0'" stroke-width="3" />
      <path d="M16 26l44 32 44-32" fill="none" :stroke="who === 'ella' ? '#E07E98' : '#5E9DD0'" stroke-width="3" stroke-linejoin="round" />
      <path class="beat" d="M60 14c-3-6-12-4-12 2 0 6 12 12 12 12s12-6 12-12c0-6-9-8-12-2z" fill="#E07E98" />
      <text v-if="!mine" x="92" y="20" font-family="Fredoka" font-size="14" fill="#8C809A">z z</text>
    </svg>

    <template v-if="mine">
      <h3>Aún no escribes tu nota {{ isToday ? 'de hoy' : 'de este día' }}</h3>
      <p>{{ nameOf(who === 'ella' ? 'el' : 'ella') }} estará feliz de leerte</p>
      <button class="btn small" :class="who === 'ella' ? 'rose' : 'blue'" @click="emit('write')">
        <AppIcon name="edit" :size="18" /> Escribir mi nota
      </button>
    </template>
    <template v-else>
      <h3>{{ nameOf(who) }} aún no escribe su nota</h3>
      <p>Cuando la escriba, aparecerá aquí</p>
      <button v-if="isToday" class="btn small" :class="who === 'ella' ? 'rose-soft' : 'blue-soft'" @click="remind">
        <AppIcon name="bell" :size="18" /> Mandarle un recordatorio
      </button>
    </template>
  </div>
</template>

<style scoped>
.pending { border: 2.5px dashed; border-radius: 26px; padding: 22px 20px; text-align: center; }
.pending.ella { border-color: #F3C3D0; background: #FFF7F9; }
.pending.el { border-color: #C9DEF0; background: #F6FAFE; }
h3 { margin: 8px 0 4px; font: 600 20px var(--f-display); }
p { margin: 0 0 16px; font: 20px/1.3 var(--f-hand); color: var(--muted); }
.beat { transform-origin: 60px 18px; animation: beat 1.8s ease-in-out infinite; }
@keyframes beat { 0%, 100% { transform: scale(1); } 15% { transform: scale(1.18); } 30% { transform: scale(1); } 45% { transform: scale(1.12); } }
</style>
