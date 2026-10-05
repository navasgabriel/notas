<script setup>
import { computed } from 'vue'
import AppIcon from './AppIcon.vue'
import NoteCard from './NoteCard.vue'
import PendingNote from './PendingNote.vue'
import { dayNotes, isFavorite, toggleFavorite } from '@/store/diary'
import { dayMonth, weekday, fromKey, todayKey } from '@/lib/dates'

const props = defineProps({ dayKey: String, closable: Boolean, compact: Boolean })
const emit = defineEmits(['write', 'close'])

const notes = computed(() => dayNotes(props.dayKey))
const year = computed(() => fromKey(props.dayKey).getFullYear())
const fav = computed(() => isFavorite(props.dayKey))
const kicker = computed(() => (props.dayKey === todayKey() ? `hoy, ${weekday(props.dayKey)}` : weekday(props.dayKey)))
</script>

<template>
  <div class="panel">
    <header class="panel-head">
      <h2><small>{{ kicker }}</small>{{ dayMonth(dayKey) }}<span v-if="year !== new Date().getFullYear()">, {{ year }}</span></h2>
      <div class="head-actions">
        <button
          class="icon-btn fav-btn" :class="{ on: fav }" :aria-pressed="fav"
          :aria-label="fav ? 'Quitar de días favoritos' : 'Marcar como día favorito'"
          :title="fav ? 'Día favorito' : 'Marcar como favorito'"
          @click="toggleFavorite(dayKey)"
        >
          <AppIcon :name="fav ? 'starfill' : 'star'" :size="24" />
        </button>
        <button v-if="closable" class="icon-btn" aria-label="Cerrar" @click="emit('close')"><AppIcon name="x" /></button>
      </div>
    </header>

    <template v-for="(who, i) in ['ella', 'el']" :key="who">
      <div v-if="i === 1" class="divider" aria-hidden="true">♥</div>
      <NoteCard v-if="notes[who]" :day-key="dayKey" :who="who" :compact="compact" @edit="emit('write')" />
      <PendingNote v-else :day-key="dayKey" :who="who" @write="emit('write')" />
    </template>
  </div>
</template>

<style scoped>
.panel { padding: 0 16px 32px; display: flex; flex-direction: column; gap: 14px; }
.panel-head { display: flex; align-items: flex-start; justify-content: space-between; padding: 6px 2px 0; }
.head-actions { display: flex; gap: 2px; }
.fav-btn.on { color: var(--honey); }
.fav-btn.on :deep(svg) { animation: pop .45s ease; }
@keyframes pop { 40% { transform: scale(1.35); } 100% { transform: scale(1); } }
h2 { margin: 0; font: 600 26px/1.15 var(--f-display); }
h2 small { display: block; font: 700 23px var(--f-script); color: var(--muted); }
.divider { display: flex; align-items: center; gap: 10px; margin: 0 20px; color: var(--ella); }
.divider::before, .divider::after { content: ""; flex: 1; border-top: 2px dashed #E9D9CF; }
</style>
