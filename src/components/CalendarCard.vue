<script setup>
import { ref, computed } from 'vue'
import AppIcon from './AppIcon.vue'
import DayCell from './DayCell.vue'
import TimeTravel from './TimeTravel.vue'
import { MONTHS, WEEKDAYS_SHORT, monthCells, capitalize } from '@/lib/dates'

const props = defineProps({
  year: Number,
  month: Number,
  selected: String,
  large: Boolean
})
const emit = defineEmits(['select', 'change-month', 'today', 'go'])
const traveling = ref(false)

const cells = computed(() => monthCells(props.year, props.month))
const title = computed(() => capitalize(MONTHS[props.month]))
const now = new Date()
const isCurrent = computed(() => props.year === now.getFullYear() && props.month === now.getMonth())
const canNext = computed(() => props.year < now.getFullYear() || (props.year === now.getFullYear() && props.month < now.getMonth()))

// deslizar a los lados para cambiar de mes (celular)
let sx = null
const onTouchStart = e => (sx = e.touches[0].clientX)
function onTouchEnd(e) {
  if (sx === null) return
  const dx = e.changedTouches[0].clientX - sx
  if (Math.abs(dx) > 60) {
    if (dx < 0 && canNext.value) emit('change-month', 1)
    if (dx > 0) emit('change-month', -1)
  }
  sx = null
}
</script>

<template>
  <section class="cal card" :class="{ large }">
    <header class="cal-head">
      <button class="icon-btn" aria-label="Mes anterior" @click="emit('change-month', -1)"><AppIcon name="left" /></button>
      <h2>
        <button class="title-btn" aria-label="Elegir mes y año" @click="traveling = true">
          <Transition name="fade" mode="out-in">
            <span :key="title + year">{{ title }} <small>{{ year }}</small></span>
          </Transition>
          <AppIcon name="down" :size="16" />
        </button>
      </h2>
      <button v-if="!isCurrent" class="today-btn" @click="emit('today')">Hoy</button>
      <button class="icon-btn" aria-label="Mes siguiente" :disabled="!canNext" @click="emit('change-month', 1)"><AppIcon name="right" /></button>
    </header>

    <div class="weekdays" aria-hidden="true">
      <span v-for="d in WEEKDAYS_SHORT" :key="d">{{ d }}</span>
    </div>

    <Transition name="fade" mode="out-in">
      <div :key="`${year}-${month}`" class="grid" @touchstart.passive="onTouchStart" @touchend="onTouchEnd">
        <template v-for="(key, i) in cells" :key="key ?? 'e' + i">
          <DayCell v-if="key" :day-key="key" :selected="key === selected" :large="large" @select="emit('select', $event)" />
          <div v-else />
        </template>
      </div>
    </Transition>

    <TimeTravel :open="traveling" :year="year" :month="month" @close="traveling = false" @go="emit('go', $event)" />

    <footer class="legend">
      <span><i class="dot ella" /> Ella</span>
      <span><i class="dot el" /> Él</span>
      <span><b class="h">♥</b> Le encantó</span>
    </footer>
  </section>
</template>

<style scoped>
.cal { padding: 14px 12px; }
.cal-head { display: flex; align-items: center; gap: 4px; margin-bottom: 8px; }
.cal-head h2 { flex: 1; margin: 0; font: 600 24px var(--f-display); text-align: center; }
.title-btn { border: 0; background: transparent; font: inherit; color: inherit; display: inline-flex; align-items: center; gap: 6px; padding: 4px 10px; border-radius: 12px; transition: background .15s; }
.title-btn:hover { background: var(--cream); }
.title-btn .app-icon { color: var(--muted); }
.cal-head h2 small { font: 700 15px var(--f-ui); color: var(--muted); margin-left: 2px; }
.cal-head .icon-btn:disabled { opacity: .3; }
.today-btn { border: 0; background: var(--ella-soft); color: var(--ella-deep); height: 32px; padding: 0 12px; border-radius: 10px; font: 700 13px var(--f-ui); }
.weekdays, .grid { display: grid; grid-template-columns: repeat(7, 1fr); gap: 5px; }
.weekdays span { text-align: center; font: 800 11px var(--f-ui); color: var(--muted); text-transform: uppercase; letter-spacing: .5px; padding-bottom: 4px; }
.legend { display: flex; justify-content: center; gap: 14px; margin-top: 12px; font-size: 12px; font-weight: 700; color: var(--muted); }
.legend span { display: flex; align-items: center; gap: 5px; }
.legend .h { color: var(--ella); }

.large { padding: 22px 22px 18px; display: flex; flex-direction: column; height: 100%; }
.large .cal-head h2 { text-align: left; font-size: 30px; order: -2; }
.large .today-btn { order: -1; margin-right: 6px; }
.large .cal-head { gap: 6px; margin-bottom: 12px; }
.large .grid { flex: 1; grid-auto-rows: 1fr; gap: 8px; }
.large .weekdays { gap: 8px; }
.large .legend { justify-content: flex-start; padding-left: 4px; }

.fade-enter-active, .fade-leave-active { transition: opacity .18s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>
