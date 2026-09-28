<script setup>
import { ref, computed, onBeforeUnmount } from 'vue'
import AppIcon from './AppIcon.vue'
import { dayNotes, me, partner, nameOf, saveNote, deleteNote, showToast } from '@/store/diary'
import { dayMonth, weekday, todayKey } from '@/lib/dates'
import { compressImage } from '@/lib/image'
import { randomPrompt, MOODS } from '@/lib/prompts'

const props = defineProps({ dayKey: String })
const emit = defineEmits(['done', 'cancel'])

const existing = dayNotes(props.dayKey)[me.value]
const img = ref(existing?.img ?? null)
const title = ref(existing?.title ?? '')
const text = ref(existing?.text ?? '')
const mood = ref(existing?.mood ?? '')
const prompt = ref(randomPrompt())
const busy = ref(false)
const listening = ref(false)

const isToday = computed(() => props.dayKey === todayKey())
const canSave = computed(() => (text.value.trim() || title.value.trim() || img.value) && !busy.value)
const accent = computed(() => (me.value === 'ella' ? 'rose' : 'blue'))

async function onFile(e) {
  const file = e.target.files?.[0]
  e.target.value = ''
  if (!file) return
  busy.value = true
  try { img.value = await compressImage(file) }
  catch { showToast('No pudimos leer esa foto') }
  finally { busy.value = false }
}

function save() {
  if (!canSave.value) return
  saveNote(props.dayKey, me.value, { img: img.value, title: title.value.trim(), text: text.value.trim(), mood: mood.value })
  showToast(existing ? 'Nota actualizada' : `Nota guardada. ${nameOf(partner.value)} ya puede verla`)
  emit('done')
}

function remove() {
  if (!confirm('¿Borrar tu nota de este día?')) return
  deleteNote(props.dayKey, me.value)
  showToast('Nota borrada')
  emit('done')
}

// Dictado por voz (si el navegador lo soporta)
let rec = null
function dictate() {
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition
  if (!SR) return showToast('Tu navegador no permite dictar')
  if (listening.value) return rec?.stop()
  rec = new SR()
  rec.lang = 'es-ES'
  rec.interimResults = false
  rec.onresult = e => {
    const said = Array.from(e.results).map(r => r[0].transcript).join(' ')
    text.value = (text.value ? text.value.trimEnd() + ' ' : '') + said
  }
  rec.onend = () => (listening.value = false)
  rec.onerror = () => (listening.value = false)
  listening.value = true
  rec.start()
}
onBeforeUnmount(() => rec?.abort())
</script>

<template>
  <form class="editor" @submit.prevent="save">
    <header class="ed-head">
      <h2><small>{{ isToday ? 'tu nota de hoy' : `tu nota del ${weekday(dayKey)}` }}</small>{{ dayMonth(dayKey) }}</h2>
      <button type="button" class="icon-btn" aria-label="Cancelar" @click="emit('cancel')"><AppIcon name="x" /></button>
    </header>

    <div class="drop" :class="{ empty: !img, busy }">
      <img v-if="img" :src="img" alt="Foto de tu nota" />
      <div v-else class="drop-empty">
        <svg viewBox="0 0 64 64" width="56" height="56" aria-hidden="true">
          <rect x="6" y="14" width="52" height="40" rx="10" fill="#fff" stroke="currentColor" stroke-width="3" />
          <circle cx="32" cy="34" r="10" fill="none" stroke="currentColor" stroke-width="3" />
          <path d="M22 14l4-6h12l4 6" fill="none" stroke="currentColor" stroke-width="3" stroke-linejoin="round" />
        </svg>
        <span>{{ busy ? 'Preparando foto…' : 'Agrega la foto de tu día' }}</span>
      </div>
      <div class="drop-actions">
        <label class="pill">
          <AppIcon name="camera" :size="18" /> Cámara
          <input type="file" accept="image/*" capture="environment" class="sr-only" @change="onFile" />
        </label>
        <label class="pill">
          <AppIcon name="image" :size="18" /> {{ img ? 'Cambiar' : 'Galería' }}
          <input type="file" accept="image/*" class="sr-only" @change="onFile" />
        </label>
        <button v-if="img" type="button" class="pill" aria-label="Quitar foto" @click="img = null"><AppIcon name="trash" :size="18" /></button>
      </div>
    </div>

    <label class="ed-label" :class="accent" for="ed-title">Mi día</label>
    <input id="ed-title" v-model="title" class="ed-title" placeholder="Ponle un título a tu día" maxlength="80" autocomplete="off" />
    <textarea v-model="text" class="ed-text" :placeholder="prompt" aria-label="Tu nota" />

    <div class="tools">
      <button type="button" class="tool" @click="prompt = randomPrompt(prompt)"><AppIcon name="shuffle" :size="18" /> Otra pregunta</button>
      <button type="button" class="tool" :class="{ rec: listening }" @click="dictate"><AppIcon name="mic" :size="18" /> {{ listening ? 'Escuchando…' : 'Dictar' }}</button>
    </div>

    <fieldset class="moods">
      <legend class="ed-label" :class="accent">¿Cómo te sentiste?</legend>
      <button v-for="m in MOODS[me]" :key="m" type="button" :class="{ on: mood === m, [accent]: true }" :aria-pressed="mood === m" @click="mood = mood === m ? '' : m">{{ m }}</button>
    </fieldset>

    <button type="submit" class="btn block" :class="accent" :disabled="!canSave">
      {{ existing ? 'Guardar cambios' : 'Guardar mi nota' }} <AppIcon name="heartfill" :size="20" />
    </button>
    <p class="foot">{{ nameOf(partner) }} la verá en el calendario con tu puntito {{ me === 'ella' ? 'rosa' : 'azul' }}</p>
    <button v-if="existing" type="button" class="delete" @click="remove"><AppIcon name="trash" :size="16" /> Borrar mi nota</button>
  </form>
</template>

<style scoped>
.editor { padding: 0 18px 30px; display: flex; flex-direction: column; }
.ed-head { display: flex; align-items: flex-start; justify-content: space-between; padding: 6px 0 12px; }
h2 { margin: 0; font: 600 26px/1.15 var(--f-display); }
h2 small { display: block; font: 700 23px var(--f-script); color: var(--muted); }

.drop { position: relative; border-radius: 24px; overflow: hidden; background: var(--sand); aspect-ratio: 1 / .9; }
.drop img { width: 100%; height: 100%; object-fit: cover; display: block; }
.drop.empty { background: repeating-linear-gradient(45deg, #FBEFE6 0 14px, #F8E8DC 14px 28px); border: 2.5px dashed #E8D3C4; }
.drop-empty { position: absolute; inset: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 10px; color: var(--muted); font: 600 17px var(--f-display); padding-bottom: 50px; }
.busy .drop-empty svg { animation: pulse 1s ease-in-out infinite; }
@keyframes pulse { 50% { opacity: .4; } }
.drop-actions { position: absolute; right: 12px; bottom: 12px; display: flex; gap: 8px; }
.pill { border: 0; height: 44px; padding: 0 14px; border-radius: 14px; background: rgba(255, 255, 255, .94); display: flex; align-items: center; gap: 6px; font-weight: 800; font-size: 14px; cursor: pointer; box-shadow: 0 6px 14px -8px rgba(0, 0, 0, .35); }
.pill:focus-within { outline: 3px solid var(--ella); }

.ed-label { display: block; font: 800 13px var(--f-ui); text-transform: uppercase; letter-spacing: 1px; margin: 22px 4px 6px; padding: 0; }
.ed-label.rose { color: var(--ella-deep); }
.ed-label.blue { color: var(--el-deep); }
.ed-title { width: 100%; border: 0; background: transparent; font: 600 26px var(--f-display); padding: 4px; outline: none; }
.ed-title::placeholder { color: #C8BCC8; }
.ed-text {
  width: 100%; min-height: 200px; border: 2px solid var(--line); background: #fff; border-radius: 20px; padding: 14px 16px; resize: vertical;
  font: 22px/1.4 var(--f-hand); outline: none; margin-top: 8px;
  background-image: repeating-linear-gradient(transparent 0 29.8px, #F3E8E0 29.8px 30.8px); background-position: 0 13px; background-attachment: local;
}
.ed-text:focus { border-color: var(--ella); }
.ed-text::placeholder { color: #B7AABB; }
.tools { display: flex; gap: 8px; margin-top: 10px; flex-wrap: wrap; }
.tool { border: 0; height: 38px; padding: 0 12px; border-radius: 12px; background: var(--sand); font-weight: 700; font-size: 13px; color: var(--ink-2); display: flex; align-items: center; gap: 6px; }
.tool.rec { background: var(--ella-soft); color: var(--ella-deep); animation: pulse 1.2s ease-in-out infinite; }
.moods { border: 0; margin: 0 0 22px; padding: 0; display: flex; flex-wrap: wrap; gap: 8px; }
.moods legend { margin-bottom: 8px; }
.moods button { flex: 1 1 22%; min-width: 72px; height: 44px; border-radius: 14px; border: 2px solid var(--line); background: #fff; font: 600 14px var(--f-display); color: var(--ink-2); transition: all .15s; }
.moods button.on.rose { border-color: var(--ella); background: var(--ella-soft); color: var(--ella-deep); }
.moods button.on.blue { border-color: var(--el); background: var(--el-soft); color: var(--el-deep); }
.foot { text-align: center; font-size: 13px; color: var(--muted); font-weight: 700; margin: 12px 0 0; }
.delete { margin: 18px auto 0; border: 0; background: transparent; color: var(--muted); font-weight: 700; font-size: 14px; display: flex; align-items: center; gap: 6px; height: 40px; padding: 0 12px; border-radius: 12px; }
.delete:hover { color: var(--ella-deep); background: var(--ella-soft); }
</style>
