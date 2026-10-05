<script setup>
import { computed } from 'vue'
import { state, dayNotes, nameOf } from '@/store/diary'
import { todayKey, daysBetween } from '@/lib/dates'

const emit = defineEmits(['open'])

// Solo las fotos de hoy; sin fotos hoy se muestra el contador de días juntos.
const today = computed(() => todayKey())
const photos = computed(() => {
  const notes = dayNotes(today.value)
  return ['ella', 'el'].filter(who => notes[who]?.thumb).map(who => ({ who, note: notes[who] }))
})
const together = computed(() => (state.couple.since ? daysBetween(state.couple.since, today.value) : null))
</script>

<template>
  <section v-if="photos.length">
    <div class="sec-head">
      <h3>Nuestras fotos de hoy</h3>
    </div>
    <div class="both" :class="{ single: photos.length === 1 }">
      <button v-for="p in photos" :key="p.who" class="photo-card" :class="p.who" @click="emit('open', today)">
        <img :src="p.note.thumb" alt="" loading="lazy" />
        <span class="cap">{{ p.note.title || p.note.text }}</span>
        <span class="by"><i class="dot" :class="p.who" />{{ nameOf(p.who) }} · hoy</span>
      </button>
    </div>
  </section>

  <section v-else-if="together !== null" class="counter">
    <b>{{ together }}</b>
    <span>{{ together === 1 ? 'día juntos' : 'días juntos' }}</span>
    <small>{{ nameOf('ella') }} <i>♥</i> {{ nameOf('el') }}</small>
  </section>
</template>

<style scoped>
.sec-head { display: flex; align-items: center; justify-content: space-between; margin: 26px 4px 12px; }
.sec-head h3 { margin: 0; font: 600 22px var(--f-display); }
.both { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
.both.single { grid-template-columns: minmax(0, 1fr); max-width: 50%; }
.photo-card {
  border: 0; text-align: left; min-width: 0;
  background: #fff; padding: 8px 8px 12px; border-radius: 8px; box-shadow: 0 10px 22px -14px rgba(74, 63, 85, .6);
  transition: transform .2s ease;
}
.photo-card.ella { border-top: 4px solid var(--ella); }
.photo-card.el { border-top: 4px solid var(--el); }
.photo-card:hover, .photo-card:focus-visible { transform: translateY(-3px); }
.photo-card img { display: block; width: 100%; aspect-ratio: 1; object-fit: cover; border-radius: 4px; }
.cap { display: block; margin: 8px 2px 0; font: 700 20px/1 var(--f-script); color: var(--ink); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.by { font-size: 11px; font-weight: 800; margin: 4px 2px 0; display: flex; align-items: center; gap: 5px; color: var(--muted); }
.by .dot { width: 7px; height: 7px; }

.counter {
  margin-top: 26px; padding: 22px 16px; border-radius: var(--radius-card); text-align: center;
  background: linear-gradient(135deg, var(--ella-soft), var(--el-soft)); box-shadow: var(--shadow-card);
}
.counter b { display: block; font: 600 56px/1 var(--f-display); color: var(--ink); }
.counter span { display: block; margin-top: 2px; font: 700 26px var(--f-script); color: var(--ink-2); }
.counter small { display: block; margin-top: 6px; font-size: 13px; font-weight: 800; color: var(--muted); }
.counter i { font-style: normal; color: var(--ella); }
</style>
