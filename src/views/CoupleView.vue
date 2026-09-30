<script setup>
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import AppIcon from '@/components/AppIcon.vue'
import { state, me, partner, partnerJoined, nameOf, initialOf, updateCouple, renewInvite, logout, memories, showToast } from '@/store/diary'
import { daysBetween } from '@/lib/dates'

const router = useRouter()
const renewing = ref(false)

const stats = computed(() => {
  const all = memories.value
  return [
    { n: all.filter(m => m.who === 'ella').length, label: `notas de ${nameOf('ella')}`, cls: 'ella' },
    { n: all.filter(m => m.who === 'el').length, label: `notas de ${nameOf('el')}`, cls: 'el' },
    { n: all.filter(m => m.note.loved).length, label: 'corazones', cls: 'love' },
    { n: state.couple.since ? daysBetween(state.couple.since) : '—', label: 'días juntos', cls: 'days' }
  ]
})

async function save(patch) {
  try { await updateCouple(patch); showToast('Guardado') } catch { /* aviso ya mostrado */ }
}

async function copyCode() {
  try { await navigator.clipboard.writeText(state.couple.inviteCode); showToast('Código copiado') }
  catch { showToast(`Tu código es ${state.couple.inviteCode}`) }
}

async function newCode() {
  renewing.value = true
  try { await renewInvite(); showToast('Código nuevo listo') } catch { /* aviso ya mostrado */ } finally { renewing.value = false }
}

function out() {
  logout()
  router.replace('/login')
}
</script>

<template>
  <div class="couple-page">
    <section class="hero card">
      <div class="big-avatars">
        <span class="avatar ella">{{ initialOf('ella') }}</span>
        <span class="heart">♥</span>
        <span class="avatar el" :class="{ waiting: !partnerJoined && partner === 'el' }">{{ initialOf('el') }}</span>
      </div>
      <h1>{{ nameOf('ella') }} &amp; {{ nameOf('el') }}</h1>
      <p>{{ state.session?.email }}</p>
    </section>

    <section v-if="!partnerJoined" class="card block invite">
      <h2>Invita a tu pareja</h2>
      <p class="hint">Que entre a la app, elija <b>Crear cuenta</b>, marque "tengo su código" y escriba:</p>
      <button v-if="state.couple.inviteCode" class="code" aria-label="Copiar código" @click="copyCode">
        {{ state.couple.inviteCode }}
        <small>toca para copiar</small>
      </button>
      <button class="btn small soft" :disabled="renewing" @click="newCode">{{ state.couple.inviteCode ? 'Generar otro código' : 'Generar código' }}</button>
    </section>

    <section class="stats">
      <div v-for="s in stats" :key="s.label" class="stat" :class="s.cls">
        <b>{{ s.n }}</b><span>{{ s.label }}</span>
      </div>
    </section>

    <section class="card block">
      <h2>Nosotros</h2>
      <label class="field"><span>Tu nombre</span>
        <input :value="state.couple[me]" maxlength="20" @change="save({ [me]: $event.target.value.trim() || nameOf(me) })" />
      </label>
      <label class="field"><span>Juntos desde</span>
        <input type="date" :value="state.couple.since" @change="save({ since: $event.target.value || null })" />
      </label>
    </section>

    <section class="card block">
      <h2>Sesión</h2>
      <div class="row">
        <span class="chip" :class="me"><span class="avatar" :class="me">{{ initialOf(me) }}</span>{{ nameOf(me) }}</span>
      </div>
      <button class="btn small soft block" @click="out"><AppIcon name="logout" :size="18" /> Cerrar sesión</button>
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
.avatar.waiting { opacity: .35; }
.invite { text-align: center; background: linear-gradient(#fff, #FFF7F9); }
.invite .hint { margin: 0 0 14px; font-size: 14px; }
.code { display: block; margin: 0 auto 14px; border: 2.5px dashed var(--ella); background: var(--ella-soft); color: var(--ella-deep); border-radius: 18px; padding: 12px 22px; font: 600 34px var(--f-display); letter-spacing: 8px; }
.code small { display: block; font: 700 11px var(--f-ui); letter-spacing: 1px; text-transform: uppercase; opacity: .8; }
.hint { font-size: 13px; color: var(--muted); font-weight: 600; margin: 4px 0 14px; line-height: 1.4; }

@media (min-width: 1024px) {
  .couple-page { height: 100dvh; overflow-y: auto; padding: 32px 40px 60px; display: grid; grid-template-columns: 1fr 1fr; align-content: start; max-width: 1000px; }
  .hero, .stats { grid-column: 1 / -1; }
  .stats { grid-template-columns: repeat(4, 1fr); }
}
</style>
