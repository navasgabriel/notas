<script setup>
import { ref, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import AppIcon from '@/components/AppIcon.vue'
import CalendarCard from '@/components/CalendarCard.vue'
import DayPanel from '@/components/DayPanel.vue'
import NoteEditor from '@/components/NoteEditor.vue'
import BottomSheet from '@/components/BottomSheet.vue'
import CouplePhotos from '@/components/CouplePhotos.vue'
import { me, nameOf, initialOf, loadMonth } from '@/store/diary'
import { todayKey, fromKey } from '@/lib/dates'
import { useMedia, DESKTOP } from '@/lib/useMedia'

const route = useRoute()
const router = useRouter()
const isDesktop = useMedia(DESKTOP)

// El día abierto vive en la URL (?dia=YYYY-MM-DD&escribir=1) para que
// el botón "atrás" del celular cierre la hoja.
const openKey = computed(() => (route.query.dia && route.query.dia <= todayKey() ? String(route.query.dia) : null))
const selected = computed(() => openKey.value ?? (isDesktop.value ? todayKey() : null))
const editing = computed(() => route.query.escribir === '1' && !!selected.value)

const start = fromKey(selected.value ?? todayKey())
const view = ref({ y: start.getFullYear(), m: start.getMonth() })
watch(selected, key => {
  if (!key) return
  const d = fromKey(key)
  view.value = { y: d.getFullYear(), m: d.getMonth() }
})

watch(view, v => loadMonth(v.y, v.m), { immediate: true })

function changeMonth(step) {
  const d = new Date(view.value.y, view.value.m + step, 1)
  view.value = { y: d.getFullYear(), m: d.getMonth() }
}
function goToday() {
  const d = new Date()
  view.value = { y: d.getFullYear(), m: d.getMonth() }
}

const nav = (query) => (isDesktop.value ? router.replace({ query }) : router.push({ query }))
const select = key => nav({ dia: key })
const write = () => router.replace({ query: { dia: selected.value, escribir: '1' } })
const backToDay = () => router.replace({ query: { dia: selected.value } })
const close = () => router.replace({ query: {} })

</script>

<template>
  <div class="home" :class="{ desktop: isDesktop }">
    <!-- ======= columna calendario ======= -->
    <div class="left">
      <header class="top">
        <div class="couple">
          <span class="avatar" :class="me">{{ initialOf(me) }}</span>
          <div class="names">
            <span class="hello">Hola, {{ nameOf(me) }}</span>
            <small>¿Quieres publicar un recuerdo?</small>
          </div>
        </div>
        <RouterLink to="/recuerdos" class="icon-btn" aria-label="Buscar recuerdos"><AppIcon name="search" /></RouterLink>
      </header>

      <CalendarCard
        :year="view.y" :month="view.m" :selected="openKey ?? (isDesktop ? selected : null)" :large="isDesktop"
        class="calendar"
        @select="select" @change-month="changeMonth" @today="goToday"
      />

      <CouplePhotos v-if="!isDesktop" @open="select" />
    </div>

    <!-- ======= escritorio: panel lateral ======= -->
    <aside v-if="isDesktop" class="right">
      <Transition name="swap" mode="out-in">
        <NoteEditor v-if="editing" :key="'e' + selected" :day-key="selected" @done="backToDay" @cancel="backToDay" />
        <DayPanel v-else :key="'d' + selected" :day-key="selected" compact @write="write" />
      </Transition>
    </aside>

    <!-- ======= celular: hoja que sube ======= -->
    <BottomSheet v-else :open="!!openKey" label="Notas del día" @close="close">
      <template v-if="openKey">
        <Transition name="swap" mode="out-in">
          <NoteEditor v-if="editing" :key="'e' + openKey" :day-key="openKey" @done="backToDay" @cancel="backToDay" />
          <DayPanel v-else :key="'d' + openKey" :day-key="openKey" closable @write="write" @close="close" />
        </Transition>
      </template>
    </BottomSheet>
  </div>
</template>

<style scoped>
.top { display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px; }
.couple { display: flex; align-items: center; gap: 10px; min-width: 0; }
.names { display: flex; flex-direction: column; min-width: 0; }
.hello { font: 600 19px/1.1 var(--f-display); }
.names small { font: 700 13px var(--f-ui); color: var(--muted); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }

.swap-enter-active, .swap-leave-active { transition: opacity .18s ease, transform .18s ease; }
.swap-enter-from { opacity: 0; transform: translateY(8px); }
.swap-leave-to { opacity: 0; transform: translateY(-6px); }

/* escritorio */
.desktop { display: grid; grid-template-columns: 1fr 440px; height: 100dvh; }
.desktop .left { padding: 28px 32px; display: flex; flex-direction: column; min-height: 0; }
.desktop .top { margin-bottom: 20px; }
.desktop .hello { font-size: 28px; }
.desktop .names small { font-size: 14px; margin-top: 2px; }
.desktop .calendar { flex: 1; min-height: 0; }
.right { background: var(--blush); border-left: 1px solid var(--line); overflow-y: auto; padding-top: 22px; }
</style>
