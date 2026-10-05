<script setup>
import { computed } from 'vue'
import { memories, nameOf } from '@/store/diary'
import { shortDate, todayKey } from '@/lib/dates'

const emit = defineEmits(['open'])

// La foto más reciente de cada uno (la de hoy si ya la subió).
const photos = computed(() =>
  ['ella', 'el'].map(who => ({ who, m: memories.value.find(x => x.who === who && x.note.thumb) }))
)
const when = key => (key === todayKey() ? 'hoy' : shortDate(key))
</script>

<template>
  <div class="both">
    <template v-for="p in photos" :key="p.who">
      <button v-if="p.m" class="photo-card" :class="p.who" @click="emit('open', p.m.key)">
        <img :src="p.m.note.thumb" alt="" loading="lazy" />
        <span class="cap">{{ p.m.note.title || p.m.note.text }}</span>
        <span class="by"><i class="dot" :class="p.who" />{{ nameOf(p.who) }} · {{ when(p.m.key) }}</span>
      </button>
      <div v-else class="photo-card empty" :class="p.who">
        <span class="ph" />
        <span class="by"><i class="dot" :class="p.who" />{{ nameOf(p.who) }} · sin fotos aún</span>
      </div>
    </template>
  </div>
</template>

<style scoped>
.both { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
.photo-card {
  border: 0; text-align: left; min-width: 0;
  background: #fff; padding: 8px 8px 12px; border-radius: 8px; box-shadow: 0 10px 22px -14px rgba(74, 63, 85, .6);
  transition: transform .2s ease;
}
.photo-card.ella { border-top: 4px solid var(--ella); }
.photo-card.el { border-top: 4px solid var(--el); }
button.photo-card:hover, button.photo-card:focus-visible { transform: translateY(-3px); }
.photo-card img, .ph { display: block; width: 100%; aspect-ratio: 1; object-fit: cover; border-radius: 4px; }
.ella .ph { background: var(--ella-soft); }
.el .ph { background: var(--el-soft); }
.cap { display: block; margin: 8px 2px 0; font: 700 20px/1 var(--f-script); color: var(--ink); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.by { font-size: 11px; font-weight: 800; margin: 4px 2px 0; display: flex; align-items: center; gap: 5px; color: var(--muted); }
.empty .by { margin-top: 8px; }
.by .dot { width: 7px; height: 7px; }
</style>
