<script setup>
import { ref, computed, watch, nextTick, onBeforeUnmount } from 'vue'
import AppIcon from './AppIcon.vue'
import { state } from '@/store/diary'
import { MONTHS, capitalize } from '@/lib/dates'

const props = defineProps({ open: Boolean, year: Number, month: Number })
const emit = defineEmits(['close', 'go'])

const now = new Date()
const thisYear = now.getFullYear()
const thisMonth = now.getMonth()

// desde el año en que empezaron (o 10 años atrás si no hay fecha) hasta hoy
const firstYear = computed(() => Math.min(state.couple.since ? Number(state.couple.since.slice(0, 4)) : thisYear - 10, props.year))
const years = computed(() => Array.from({ length: thisYear - firstYear.value + 1 }, (_, i) => firstYear.value + i))

const y = ref(props.year)
const m = ref(props.month)
const isFuture = (yy, mm) => yy > thisYear || (yy === thisYear && mm > thisMonth)

const strip = ref(null)
function centerYear(smooth = true) {
  nextTick(() => strip.value?.querySelector('.on')?.scrollIntoView({ inline: 'center', block: 'nearest', behavior: smooth ? 'smooth' : 'auto' }))
}

function pickYear(yy) {
  y.value = yy
  if (isFuture(yy, m.value)) m.value = thisMonth
  centerYear()
}
const stepYear = d => years.value.includes(y.value + d) && pickYear(y.value + d)

const ago = computed(() => {
  const months = (thisYear - y.value) * 12 + (thisMonth - m.value)
  if (months === 0) return 'este mes'
  if (months < 12) return `hace ${months} ${months === 1 ? 'mes' : 'meses'}`
  const yrs = Math.floor(months / 12)
  const rest = months % 12
  return `hace ${yrs} ${yrs === 1 ? 'año' : 'años'}${rest ? ` y ${rest} ${rest === 1 ? 'mes' : 'meses'}` : ''}`
})
const same = computed(() => y.value === props.year && m.value === props.month)

function travel() {
  emit('go', { y: y.value, m: m.value })
  emit('close')
}

const onKey = e => {
  if (e.key === 'Escape') emit('close')
  if (e.key === 'ArrowLeft') stepYear(-1)
  if (e.key === 'ArrowRight') stepYear(1)
}
watch(() => props.open, open => {
  if (open) {
    y.value = props.year
    m.value = props.month
    centerYear(false)
    addEventListener('keydown', onKey)
  } else removeEventListener('keydown', onKey)
})
onBeforeUnmount(() => removeEventListener('keydown', onKey))
</script>

<template>
  <Teleport to="body">
    <Transition name="tt">
      <div v-if="open" class="overlay" @click.self="emit('close')">
        <div class="modal" role="dialog" aria-modal="true" aria-label="Viajar en el tiempo">
          <header>
            <span class="clock" aria-hidden="true">⏳</span>
            <h2>¿A dónde viajamos?</h2>
            <button class="icon-btn" aria-label="Cerrar" @click="emit('close')"><AppIcon name="x" /></button>
          </header>

          <!-- años -->
          <div class="years">
            <button class="icon-btn" aria-label="Año anterior" :disabled="y === years[0]" @click="stepYear(-1)"><AppIcon name="left" /></button>
            <div ref="strip" class="strip" role="listbox" aria-label="Año">
              <button
                v-for="yy in years" :key="yy" role="option" class="year" :class="{ on: yy === y }"
                :aria-selected="yy === y" @click="pickYear(yy)"
              >{{ yy }}</button>
            </div>
            <button class="icon-btn" aria-label="Año siguiente" :disabled="y === thisYear" @click="stepYear(1)"><AppIcon name="right" /></button>
          </div>

          <!-- meses -->
          <div class="months" role="listbox" aria-label="Mes">
            <button
              v-for="(name, i) in MONTHS" :key="name" role="option" class="month"
              :class="{ on: i === m, now: y === thisYear && i === thisMonth }"
              :aria-selected="i === m" :disabled="isFuture(y, i)" @click="m = i"
            >{{ capitalize(name.slice(0, 3)) }}</button>
          </div>

          <Transition name="fade" mode="out-in">
            <p :key="`${y}-${m}`" class="dest">
              <b>{{ capitalize(MONTHS[m]) }} de {{ y }}</b>
              <span>{{ ago }}</span>
            </p>
          </Transition>

          <button class="btn block primary go" :disabled="same" @click="travel">
            <span aria-hidden="true">✨</span> Viajar en el tiempo
          </button>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.overlay { position: fixed; inset: 0; z-index: 60; background: rgba(74, 63, 85, .38); backdrop-filter: blur(3px); display: grid; place-items: center; padding: 16px; }
.modal { width: min(400px, 100%); background: var(--paper); border-radius: var(--radius-card); padding: 16px 16px 18px; box-shadow: 0 30px 60px -24px rgba(40, 25, 45, .55); }

header { display: flex; align-items: center; gap: 8px; margin-bottom: 12px; }
header h2 { flex: 1; margin: 0; font: 600 22px var(--f-display); }
.clock { font-size: 26px; display: inline-block; animation: flip 3s ease-in-out infinite; }
@keyframes flip { 0%, 70% { transform: rotate(0); } 85%, 100% { transform: rotate(180deg); } }

.years { display: flex; align-items: center; gap: 2px; }
.years .icon-btn:disabled { opacity: .3; }
.strip { flex: 1; display: flex; gap: 6px; overflow-x: auto; scroll-snap-type: x mandatory; scrollbar-width: none; padding: 6px 0; mask-image: linear-gradient(90deg, transparent, #000 18%, #000 82%, transparent); }
.strip::-webkit-scrollbar { display: none; }
.strip::before, .strip::after { content: ""; flex: 0 0 35%; }
.year {
  flex: none; scroll-snap-align: center; border: 0; background: transparent; padding: 6px 10px; border-radius: 12px;
  font: 600 18px var(--f-display); color: var(--muted); transition: transform .2s, color .2s, background .2s;
}
.year.on { color: #fff; background: var(--ink); transform: scale(1.18); }

.months { display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; margin-top: 14px; }
.month {
  height: 46px; border-radius: 14px; border: 2px solid var(--line); background: #fff;
  font: 600 15px var(--f-display); color: var(--ink-2); transition: all .15s;
}
.month:hover:not(:disabled) { border-color: var(--ella); }
.month.now { border-style: dashed; }
.month.on { background: var(--ella-deep); border-color: var(--ella-deep); color: #fff; transform: scale(1.05); box-shadow: 0 8px 16px -8px rgba(196, 92, 121, .8); }
.month:disabled { opacity: .35; }

.dest { margin: 16px 0 14px; text-align: center; }
.dest b { display: block; font: 600 20px var(--f-display); }
.dest span { font: 700 20px var(--f-script); color: var(--muted); }

.tt-enter-active, .tt-leave-active { transition: opacity .2s; }
.tt-enter-active .modal, .tt-leave-active .modal { transition: transform .25s cubic-bezier(.2, .9, .3, 1.2); }
.tt-enter-from, .tt-leave-to { opacity: 0; }
.tt-enter-from .modal, .tt-leave-to .modal { transform: scale(.92) translateY(10px); }
.fade-enter-active, .fade-leave-active { transition: opacity .15s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
@media (prefers-reduced-motion: reduce) { .clock { animation: none; } }
</style>
