<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import AppIcon from './AppIcon.vue'
import { state, me, nameOf, initialOf, dayNotes } from '@/store/diary'
import { todayKey, fromKey, daysBetween } from '@/lib/dates'
import { useOpenToday } from '@/lib/useToday'

const route = useRoute()
const openToday = useOpenToday()
const todayNum = computed(() => fromKey(todayKey()).getDate())
const wroteToday = computed(() => !!dayNotes(todayKey())[me.value])
const together = computed(() => (state.couple.since ? daysBetween(state.couple.since) : null))

const links = [
  { to: '/', label: 'Calendario', icon: 'cal', name: 'home' },
  { to: '/recuerdos', label: 'Recuerdos', icon: 'photos', name: 'memories' },
  { to: '/favoritos', label: 'Días favoritos', icon: 'star', name: 'favorites' },
  { to: '/nosotros', label: 'Nosotros', icon: 'users', name: 'couple' }
]
</script>

<template>
  <div class="shell">
    <!-- escritorio -->
    <aside class="side">
      <RouterLink to="/" class="brand">Nuestros <span>Días</span></RouterLink>
      <button class="btn block write" :class="me === 'ella' ? 'rose' : 'blue'" @click="openToday">
        <AppIcon :name="wroteToday ? 'heartfill' : 'edit'" :size="20" />
        {{ wroteToday ? 'Ver el día de hoy' : 'Escribir mi nota' }}
      </button>
      <nav>
        <RouterLink v-for="l in links" :key="l.to" :to="l.to" class="side-link" :class="{ on: route.name === l.name }">
          <AppIcon :name="l.icon" /> {{ l.label }}
        </RouterLink>
      </nav>
      <RouterLink to="/nosotros" class="couple-box">
        <div class="avatars"><span class="avatar ella">{{ initialOf('ella') }}</span><span class="avatar el">{{ initialOf('el') }}</span></div>
        <div class="names">{{ nameOf('ella') }} &amp; {{ nameOf('el') }}<small v-if="together !== null">{{ together }} días juntos</small></div>
      </RouterLink>
    </aside>

    <main class="main">
      <slot />
    </main>

    <!-- celular -->
    <nav class="bottom-nav" aria-label="Principal">
      <RouterLink :to="links[0].to" class="nav-btn" :class="{ on: route.name === 'home' }" aria-label="Calendario"><AppIcon name="cal" :size="24" /><span>Calendario</span></RouterLink>
      <RouterLink :to="links[1].to" class="nav-btn" :class="{ on: route.name === 'memories' }" aria-label="Recuerdos"><AppIcon name="photos" :size="24" /><span>Recuerdos</span></RouterLink>
      <button class="fab" :class="[me, { done: wroteToday }]" :aria-label="wroteToday ? 'Ver el día de hoy' : 'Escribir la nota de hoy'" @click="openToday">
        <b>{{ todayNum }}</b><small>{{ wroteToday ? 'hoy' : 'escribir' }}</small>
      </button>
      <RouterLink :to="links[2].to" class="nav-btn" :class="{ on: route.name === 'favorites' }" aria-label="Días favoritos"><AppIcon name="star" :size="24" /><span>Favoritos</span></RouterLink>
      <RouterLink :to="links[3].to" class="nav-btn" :class="{ on: route.name === 'couple' }" aria-label="Nosotros"><AppIcon name="users" :size="24" /><span>Nosotros</span></RouterLink>
    </nav>
  </div>
</template>

<style scoped>
.shell { min-height: 100dvh; }
.side { display: none; }
.main { max-width: 560px; margin: 0 auto; padding: 22px 16px calc(120px + env(safe-area-inset-bottom)); }

.bottom-nav {
  position: fixed; left: 0; right: 0; bottom: 0; z-index: 30;
  height: calc(80px + env(safe-area-inset-bottom)); padding-bottom: env(safe-area-inset-bottom);
  background: rgba(255, 255, 255, .94); backdrop-filter: blur(10px); border-top: 1px solid var(--line);
  display: grid; grid-template-columns: repeat(5, 1fr); align-items: center; justify-items: center;
}
.nav-btn { display: flex; flex-direction: column; align-items: center; gap: 3px; text-decoration: none; color: var(--muted); font-size: 11px; font-weight: 800; padding: 6px 4px; border-radius: 12px; min-width: 56px; }
.nav-btn.on { color: var(--ink); }
.nav-btn.on span { color: var(--ella-deep); }
.fab {
  width: 74px; height: 74px; border-radius: 50%; border: 5px solid var(--cream); margin-top: -34px; color: #fff;
  display: flex; flex-direction: column; align-items: center; justify-content: center; transition: transform .15s;
}
.fab:active { transform: scale(.94); }
.fab.ella { background: var(--ella-deep); box-shadow: 0 14px 26px -12px rgba(196, 92, 121, .9); }
.fab.el { background: var(--el-deep); box-shadow: 0 14px 26px -12px rgba(63, 127, 180, .9); }
.fab b { font: 600 28px/1 var(--f-display); }
.fab small { font: 800 9px var(--f-ui); letter-spacing: 1px; text-transform: uppercase; opacity: .92; }
.fab:not(.done) { animation: nudge 3s ease-in-out infinite; }
@keyframes nudge { 0%, 88%, 100% { transform: rotate(0); } 91% { transform: rotate(-8deg); } 94% { transform: rotate(8deg); } 97% { transform: rotate(-4deg); } }

@media (min-width: 1024px) {
  .shell { display: grid; grid-template-columns: 250px 1fr; height: 100dvh; min-height: 0; }
  .bottom-nav { display: none; }
  .main { max-width: none; margin: 0; padding: 0; overflow: hidden; height: 100dvh; }
  .side { display: flex; flex-direction: column; gap: 6px; background: var(--paper); border-right: 1px solid var(--line); padding: 28px 18px; }
  .brand { font: 700 30px/1 var(--f-display); color: var(--ink); text-decoration: none; margin: 0 6px 22px; letter-spacing: -.3px; }
  .brand span { color: var(--ella-deep); }
  .write { font-size: 15px; height: 50px; margin-bottom: 18px; }
  nav { display: flex; flex-direction: column; gap: 4px; }
  .side-link { display: flex; align-items: center; gap: 12px; height: 46px; padding: 0 12px; border-radius: 14px; text-decoration: none; color: var(--ink-2); font: 600 16px var(--f-display); transition: background .15s; }
  .side-link:hover { background: var(--cream); }
  .side-link.on { background: var(--ella-soft); color: var(--ella-deep); }
  .couple-box { margin-top: auto; display: flex; align-items: center; gap: 10px; background: var(--cream); padding: 12px; border-radius: 18px; text-decoration: none; }
  .names { font: 600 16px/1.15 var(--f-display); }
  .names small { display: block; font: 700 12px var(--f-ui); color: var(--muted); }
}
</style>
