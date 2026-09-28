<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import AppIcon from '@/components/AppIcon.vue'
import { state, me, partner, nameOf, initialOf, updateCouple, switchWho, logout, resetDemo, clearNotes, memories, showToast } from '@/store/diary'
import { daysBetween } from '@/lib/dates'

const router = useRouter()

const stats = computed(() => {
  const all = memories.value
  return [
    { n: all.filter(m => m.who === 'ella').length, label: `notas de ${nameOf('ella')}`, cls: 'ella' },
    { n: all.filter(m => m.who === 'el').length, label: `notas de ${nameOf('el')}`, cls: 'el' },
    { n: all.filter(m => m.note.loved).length, label: 'corazones', cls: 'love' },
    { n: state.couple.since ? daysBetween(state.couple.since) : '—', label: 'días juntos', cls: 'days' }
  ]
})

function swap() {
  switchWho()
  showToast(`Ahora estás como ${nameOf(me.value)}`)
}
function out() {
  logout()
  router.replace('/login')
}
function clear() {
  if (confirm('¿Borrar todas las notas de este navegador?')) clearNotes()
}
</script>

<template>
  <div class="couple-page">
    <section class="hero card">
      <div class="big-avatars">
        <span class="avatar ella">{{ initialOf('ella') }}</span>
        <span class="heart">♥</span>
        <span class="avatar el">{{ initialOf('el') }}</span>
      </div>
      <h1>{{ nameOf('ella') }} &amp; {{ nameOf('el') }}</h1>
      <p>{{ state.session?.email }}</p>
    </section>

    <section class="stats">
      <div v-for="s in stats" :key="s.label" class="stat" :class="s.cls">
        <b>{{ s.n }}</b><span>{{ s.label }}</span>
      </div>
    </section>

    <section class="card block">
      <h2>Nosotros</h2>
      <label class="field"><span>Nombre de ella</span>
        <input :value="state.couple.ella" maxlength="20" @change="updateCouple({ ella: $event.target.value.trim() || 'Ella' })" />
      </label>
      <label class="field"><span>Nombre de él</span>
        <input :value="state.couple.el" maxlength="20" @change="updateCouple({ el: $event.target.value.trim() || 'Él' })" />
      </label>
      <label class="field"><span>Juntos desde</span>
        <input type="date" :value="state.couple.since" @change="updateCouple({ since: $event.target.value || null })" />
      </label>
    </section>

    <section class="card block">
      <h2>Sesión</h2>
      <div class="row">
        <span class="chip" :class="me"><span class="avatar" :class="me">{{ initialOf(me) }}</span>Estás como {{ nameOf(me) }}</span>
        <button class="btn small soft" @click="swap"><AppIcon name="swap" :size="18" /> Cambiar a {{ nameOf(partner) }}</button>
      </div>
      <p class="hint">Mientras no haya base de datos, los dos comparten este navegador. Este botón sirve para probar como tu pareja.</p>
      <button class="btn small soft block" @click="out"><AppIcon name="logout" :size="18" /> Cerrar sesión</button>
    </section>

    <section class="card block">
      <h2>Datos del prototipo</h2>
      <div class="row">
        <button class="btn small soft" @click="resetDemo">Restaurar ejemplo</button>
        <button class="btn small rose-soft" @click="clear"><AppIcon name="trash" :size="18" /> Vaciar diario</button>
      </div>
    </section>
  </div>
</template>

<style scoped>
.couple-page { display: flex; flex-direction: column; gap: 16px; }
.hero { text-align: center; padding: 28px 20px 22px; background: radial-gradient(100% 90% at 50% 0%, #FFE3EA, #fff 70%); }
.big-avatars { display: flex; align-items: center; justify-content: center; gap: 10px; }
.big-avatars .avatar { width: 72px; height: 72px; font-size: 30px; border-width: 4px; }
.big-avatars .heart { color: var(--ella); font-size: 26px; animation: beat 1.6s ease-in-out infinite; }
@keyframes beat { 15% { transform: scale(1.25); } 30% { transform: scale(1); } 45% { transform: scale(1.15); } }
.hero h1 { margin: 12px 0 2px; font: 600 30px var(--f-display); }
.hero p { margin: 0; color: var(--muted); font-weight: 700; font-size: 14px; }
.stats { display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; }
.stat { border-radius: 22px; padding: 16px; background: #fff; box-shadow: var(--shadow-card); }
.stat b { display: block; font: 600 34px/1 var(--f-display); }
.stat span { font: 700 13px var(--f-ui); color: var(--muted); }
.stat.ella b { color: var(--ella-deep); }
.stat.el b { color: var(--el-deep); }
.stat.love b { color: var(--ella); }
.stat.days b { color: #C69221; }
.block { padding: 20px; }
.block h2 { margin: 0 0 14px; font: 600 20px var(--f-display); }
.row { display: flex; flex-wrap: wrap; gap: 10px; align-items: center; margin-bottom: 10px; }
.hint { font-size: 13px; color: var(--muted); font-weight: 600; margin: 4px 0 14px; line-height: 1.4; }

@media (min-width: 1024px) {
  .couple-page { height: 100dvh; overflow-y: auto; padding: 32px 40px 60px; display: grid; grid-template-columns: 1fr 1fr; align-content: start; max-width: 1000px; }
  .hero, .stats { grid-column: 1 / -1; }
  .stats { grid-template-columns: repeat(4, 1fr); }
}
</style>
