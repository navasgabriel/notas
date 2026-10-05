<script setup>
import { computed, ref, watch } from 'vue'
import AppIcon from './AppIcon.vue'
import { state, dayNotes, me, nameOf, initialOf, partnerOf, toggleLove, showToast, loadPhoto } from '@/store/diary'
import { timeOf, dayMonth } from '@/lib/dates'
import { moodEmoji } from '@/lib/prompts'

const props = defineProps({ dayKey: String, who: String, compact: Boolean })
const emit = defineEmits(['edit'])

const note = computed(() => dayNotes(props.dayKey)[props.who])
const mine = computed(() => props.who === me.value)
const zoom = ref(false)
const photo = computed(() => state.photos[`${props.dayKey}_${props.who}`] ?? note.value?.thumb)
watch(() => [props.dayKey, note.value?.updatedAt], () => loadPhoto(props.dayKey, props.who).catch(() => {}), { immediate: true })
const pop = ref(false)

const loveLabel = computed(() => {
  if (note.value.loved) return mine.value ? `A ${nameOf(partnerOf(props.who))} le encantó` : 'Te encantó'
  return mine.value ? '' : 'Dale amor'
})

function love() {
  toggleLove(props.dayKey, props.who)
  if (note.value.loved) { pop.value = true; setTimeout(() => (pop.value = false), 500) }
}

async function share() {
  const text = `${note.value.title ? note.value.title + '\n\n' : ''}${note.value.text}\n\n— ${nameOf(props.who)}, ${dayMonth(props.dayKey)}`
  try {
    if (navigator.share) await navigator.share({ title: 'Nuestros Días', text })
    else { await navigator.clipboard.writeText(text); showToast('Nota copiada') }
  } catch { /* el usuario canceló */ }
}
</script>

<template>
  <article class="note" :class="[who, { compact }]">
    <header class="head">
      <span class="chip" :class="who"><span class="avatar" :class="who">{{ initialOf(who) }}</span>Nota de {{ who === 'ella' ? 'ella' : 'él' }}</span>
      <span v-if="note.moods.length" class="moods">
        <span v-for="m in note.moods" :key="m" class="mood">{{ moodEmoji(m) }} {{ m }}</span>
      </span>
    </header>

    <button v-if="note.hasPhoto" class="photo" aria-label="Ver foto completa" @click="zoom = true">
      <img :src="photo" alt="" />
    </button>

    <div class="actions">
      <button
        class="icon-btn love-btn" :class="{ on: note.loved, pop }"
        :disabled="mine" :aria-pressed="note.loved"
        :aria-label="mine ? 'Corazón de tu pareja' : 'Me encanta'"
        @click="love"
      >
        <AppIcon :name="note.loved ? 'heartfill' : 'heart'" :size="24" />
      </button>
      <span class="love-label" :class="{ on: note.loved }">{{ loveLabel }}</span>
      <span class="sp" />
      <button class="icon-btn" aria-label="Compartir" @click="share"><AppIcon name="share" /></button>
      <button v-if="mine" class="icon-btn" aria-label="Editar mi nota" @click="emit('edit')"><AppIcon name="edit" /></button>
    </div>

    <h3 v-if="note.title">{{ note.title }}</h3>
    <p class="text">{{ note.text }}</p>
    <div class="time">{{ nameOf(who) }} · escrita a las {{ timeOf(note.createdAt) }}</div>

    <Teleport to="body">
      <Transition name="zoom">
        <div v-if="zoom" class="lightbox" role="dialog" aria-label="Foto" @click="zoom = false">
          <img :src="photo" alt="" />
          <button class="icon-btn close" aria-label="Cerrar"><AppIcon name="x" /></button>
        </div>
      </Transition>
    </Teleport>
  </article>
</template>

<style scoped>
.note { background: var(--paper); border-radius: 26px; padding: 14px; box-shadow: 0 14px 28px -22px rgba(74, 63, 85, .6); }
.note.ella { border-top: 6px solid var(--ella); }
.note.el { border-top: 6px solid var(--el); }
.head { display: flex; align-items: center; justify-content: space-between; gap: 8px; }
.head { flex-wrap: wrap; }
.moods { display: flex; flex-wrap: wrap; justify-content: flex-end; gap: 2px 10px; padding-right: 6px; }
.mood { font: 700 20px var(--f-script); color: var(--muted); white-space: nowrap; }
.photo { display: block; width: 100%; border: 0; padding: 0; margin-top: 12px; border-radius: 18px; overflow: hidden; background: var(--sand); cursor: zoom-in; }
.photo img { display: block; width: 100%; aspect-ratio: 4 / 3.4; object-fit: cover; transition: transform .4s ease; }
.photo:hover img { transform: scale(1.03); }
.compact .photo img { aspect-ratio: 16 / 10; }
.actions { display: flex; align-items: center; gap: 2px; margin: 6px -6px 0; }
.sp { flex: 1; }
.love-btn.on { color: var(--ella); }
.love-btn:disabled { opacity: 1; }
.love-btn.pop { animation: pop .45s ease; }
@keyframes pop { 40% { transform: scale(1.35); } 100% { transform: scale(1); } }
.love-label { font-size: 13px; font-weight: 800; color: var(--muted); }
.love-label.on { color: var(--ella-deep); }
h3 { margin: 4px 4px 6px; font: 600 23px/1.2 var(--f-display); }
.text { margin: 0 4px 10px; font: 21px/1.35 var(--f-hand); color: var(--ink-2); white-space: pre-line; overflow-wrap: anywhere; }
.compact .text { font-size: 19px; }
.time { margin: 0 4px; font-size: 12px; font-weight: 800; color: var(--muted); }

.lightbox { position: fixed; inset: 0; z-index: 80; background: rgba(35, 25, 40, .88); display: grid; place-items: center; padding: 24px; cursor: zoom-out; }
.lightbox img { max-width: 100%; max-height: 100%; border-radius: 12px; box-shadow: 0 30px 60px rgba(0, 0, 0, .5); }
.lightbox .close { position: absolute; top: 16px; right: 16px; background: rgba(255, 255, 255, .9); color: var(--ink); }
.zoom-enter-active, .zoom-leave-active { transition: opacity .2s ease; }
.zoom-enter-from, .zoom-leave-to { opacity: 0; }
</style>
