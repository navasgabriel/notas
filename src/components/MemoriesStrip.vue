<script setup>
import { nameOf } from '@/store/diary'
import { shortDate } from '@/lib/dates'

defineProps({ items: Array })
const emit = defineEmits(['open'])
</script>

<template>
  <div class="strip">
    <button v-for="m in items" :key="m.key + m.who" class="polaroid" @click="emit('open', m.key)">
      <img :src="m.note.img" alt="" loading="lazy" />
      <span class="cap">{{ m.note.title || m.note.text }}</span>
      <span class="by"><i class="dot" :class="m.who" />{{ nameOf(m.who) }} · {{ shortDate(m.key) }}</span>
    </button>
  </div>
</template>

<style scoped>
.strip { display: flex; gap: 14px; overflow-x: auto; padding: 8px 4px 16px; margin: 0 -16px; padding-left: 20px; padding-right: 20px; scroll-snap-type: x mandatory; scrollbar-width: none; }
.strip::-webkit-scrollbar { display: none; }
.polaroid {
  flex: 0 0 140px; scroll-snap-align: start; border: 0; text-align: left;
  background: #fff; padding: 8px 8px 12px; border-radius: 6px; box-shadow: 0 10px 22px -14px rgba(74, 63, 85, .6);
  transition: transform .2s ease;
}
.polaroid:nth-child(odd) { transform: rotate(-2deg); }
.polaroid:nth-child(even) { transform: rotate(1.6deg); }
.polaroid:hover, .polaroid:focus-visible { transform: rotate(0) translateY(-3px); }
.polaroid img { display: block; width: 100%; height: 150px; object-fit: cover; border-radius: 3px; }
.cap { display: block; margin: 8px 2px 0; font: 700 20px/1 var(--f-script); color: var(--ink); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.by { font-size: 11px; font-weight: 800; margin: 4px 2px 0; display: flex; align-items: center; gap: 5px; color: var(--muted); }
.by .dot { width: 7px; height: 7px; }
</style>
