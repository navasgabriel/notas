<script setup>
import { computed } from 'vue'
import { dayNotes, nameOf } from '@/store/diary'
import { fromKey, dayMonth, todayKey } from '@/lib/dates'

const props = defineProps({ dayKey: String, selected: Boolean, large: Boolean })
const emit = defineEmits(['select'])

const notes = computed(() => dayNotes(props.dayKey))
const photos = computed(() => ['ella', 'el'].map(w => notes.value[w]?.thumb).filter(Boolean))
const loved = computed(() => notes.value.ella?.loved || notes.value.el?.loved)
const isToday = computed(() => props.dayKey === todayKey())
const isFuture = computed(() => props.dayKey > todayKey())
const num = computed(() => fromKey(props.dayKey).getDate())

const label = computed(() => {
  const who = ['ella', 'el'].filter(w => notes.value[w]).map(nameOf)
  return `${dayMonth(props.dayKey)}${who.length ? ', notas de ' + who.join(' y ') : ', sin notas'}`
})
</script>

<template>
  <button
    class="day"
    :class="{ photo: photos.length, today: isToday, selected, future: isFuture, large }"
    :disabled="isFuture"
    :aria-label="label"
    :aria-pressed="selected"
    @click="emit('select', dayKey)"
  >
    <span v-if="photos.length" class="imgs">
      <img v-for="(src, i) in photos" :key="i" :src="src" alt="" loading="lazy" />
    </span>
    <span class="num">{{ num }}</span>
    <span v-if="loved" class="hrt" aria-hidden="true">♥</span>
    <span class="dots">
      <i v-if="notes.ella" class="dot ella" />
      <i v-if="notes.el" class="dot el" />
    </span>
  </button>
</template>

<style scoped>
.day {
  position: relative; aspect-ratio: 1; border-radius: 12px; background: #FBF6F1; border: 0; padding: 0;
  overflow: hidden; display: block; width: 100%;
  transition: transform .15s ease, box-shadow .15s ease;
}
.day:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 8px 16px -10px rgba(74, 63, 85, .6); }
.day:active:not(:disabled) { transform: scale(.94); }
.imgs { position: absolute; inset: 0; display: flex; }
.imgs img { flex: 1; min-width: 0; height: 100%; object-fit: cover; }
.imgs img + img { border-left: 2px solid #fff; }
.num {
  position: absolute; left: 0; right: 0; top: 50%; transform: translateY(-58%); text-align: center;
  font: 600 15px var(--f-display); color: var(--ink);
}
.photo .num { color: #fff; text-shadow: 0 1px 4px rgba(0, 0, 0, .5); }
.photo::after { content: ""; position: absolute; inset: 0; background: linear-gradient(transparent 55%, rgba(0, 0, 0, .18)); pointer-events: none; }
.dots { position: absolute; left: 0; right: 0; bottom: 5px; display: flex; justify-content: center; gap: 3px; z-index: 1; }
.dots .dot { width: 7px; height: 7px; box-shadow: 0 0 0 1.5px #fff; }
.hrt { position: absolute; right: 4px; top: 2px; font-size: 11px; color: #fff; text-shadow: 0 1px 3px rgba(0, 0, 0, .45); z-index: 1; }
.day:not(.photo) .hrt { color: var(--ella); text-shadow: none; }
.today { box-shadow: inset 0 0 0 2.5px var(--ink); }
.today.photo::before { content: ""; position: absolute; inset: 0; border: 2.5px solid var(--ink); border-radius: 12px; z-index: 2; pointer-events: none; }
.selected { outline: 3px solid var(--ella); outline-offset: 2px; }
.future { background: transparent; }
.future .num { color: #CFC5CF; }

/* escritorio: celdas rectangulares, número arriba a la izquierda */
.large { aspect-ratio: auto; height: 100%; min-height: 70px; border-radius: 14px; }
.large .num { top: 8px; left: 10px; right: auto; transform: none; font-size: 16px; }
.large .dots { justify-content: flex-start; left: 10px; bottom: 8px; }
.large .dots .dot { width: 9px; height: 9px; }
.large .hrt { font-size: 14px; right: 8px; top: 6px; }
.large.today.photo::before { border-radius: 14px; }
</style>
