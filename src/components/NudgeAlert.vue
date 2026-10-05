<script setup>
import { computed, watch, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'
import { state, dismissNudge } from '@/store/diary'
import { useOpenToday } from '@/lib/useToday'

const router = useRouter()
const openToday = useOpenToday()

// se muestran de uno en uno, en el orden en que llegaron
const current = computed(() => state.nudges[0] ?? null)

let timer
watch(current, n => {
  clearTimeout(timer)
  if (n) timer = setTimeout(() => dismissNudge(n.id), 8000)
}, { immediate: true })
onBeforeUnmount(() => clearTimeout(timer))

const action = computed(() => {
  const n = current.value
  if (!n) return null
  if (n.type === 'write') return { label: 'Escribir', run: openToday }
  if (n.date) return { label: 'Ver', run: () => router.push({ path: '/', query: { dia: n.date } }) }
  return null
})

function go() {
  const n = current.value
  action.value.run()
  dismissNudge(n.id)
}
</script>

<template>
  <Transition name="nudge">
    <div v-if="current" :key="current.id" class="nudge" role="alert">
      <span class="emoji" aria-hidden="true">{{ current.emoji }}</span>
      <p>{{ current.text }}</p>
      <div class="acts">
        <button v-if="action" class="btn small rose" @click="go">{{ action.label }}</button>
        <button class="btn small soft" @click="dismissNudge(current.id)">{{ action ? 'Luego' : '♥ Gracias' }}</button>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.nudge {
  position: fixed; top: calc(16px + env(safe-area-inset-top)); left: 50%; transform: translateX(-50%); z-index: 90;
  width: min(380px, calc(100vw - 32px)); background: var(--paper); border-radius: var(--radius-card);
  padding: 18px 18px 16px; text-align: center; box-shadow: 0 24px 50px -18px rgba(74, 63, 85, .55);
  border-top: 6px solid var(--ella);
}
.emoji { display: block; font-size: 52px; line-height: 1; animation: beat 1.1s ease-in-out infinite; }
p { margin: 10px 0 14px; font: 600 19px/1.25 var(--f-display); color: var(--ink); }
.acts { display: flex; gap: 8px; justify-content: center; }
.acts .btn { flex: 1; }
@keyframes beat { 0%, 100% { transform: scale(1); } 15% { transform: scale(1.25); } 30% { transform: scale(1); } 45% { transform: scale(1.15); } }

.nudge-enter-active, .nudge-leave-active { transition: opacity .25s, transform .3s cubic-bezier(.2, .9, .3, 1.3); }
.nudge-enter-from, .nudge-leave-to { opacity: 0; transform: translate(-50%, -24px) scale(.95); }
@media (prefers-reduced-motion: reduce) { .emoji { animation: none; } }
</style>
