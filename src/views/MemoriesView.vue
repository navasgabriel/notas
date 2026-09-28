<script setup>
import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import AppIcon from '@/components/AppIcon.vue'
import { memories, nameOf } from '@/store/diary'
import { dayMonth, fromKey } from '@/lib/dates'

const route = useRoute()
const router = useRouter()
const q = ref('')

const FILTERS = [
  { id: 'todos', label: 'Todos' },
  { id: 'ella', label: 'De ella' },
  { id: 'el', label: 'De él' },
  { id: 'favoritos', label: 'Le encantó' }
]
const filter = computed(() => (FILTERS.some(f => f.id === route.query.filtro) ? route.query.filtro : 'todos'))
const setFilter = id => router.replace({ query: id === 'todos' ? {} : { filtro: id } })

const list = computed(() => {
  const term = q.value.trim().toLowerCase()
  return memories.value.filter(({ who, note }) => {
    if (filter.value === 'ella' || filter.value === 'el') { if (who !== filter.value) return false }
    if (filter.value === 'favoritos' && !note.loved) return false
    return !term || `${note.title} ${note.text}`.toLowerCase().includes(term)
  })
})

const open = key => router.push({ path: '/', query: { dia: key } })
</script>

<template>
  <div class="mem">
    <header>
      <h1>{{ filter === 'favoritos' ? 'Lo que más nos gustó' : 'Nuestros recuerdos' }}</h1>
      <p>{{ list.length }} {{ list.length === 1 ? 'nota' : 'notas' }}</p>
    </header>

    <label class="search">
      <AppIcon name="search" />
      <input v-model="q" type="search" placeholder="Buscar en nuestras notas…" aria-label="Buscar" />
    </label>

    <div class="filters" role="tablist">
      <button v-for="f in FILTERS" :key="f.id" role="tab" :aria-selected="filter === f.id" :class="{ on: filter === f.id }" @click="setFilter(f.id)">
        <i v-if="f.id === 'ella' || f.id === 'el'" class="dot" :class="f.id" />
        <b v-if="f.id === 'favoritos'" class="h">♥</b>
        {{ f.label }}
      </button>
    </div>

    <TransitionGroup v-if="list.length" name="list" tag="div" class="grid">
      <button v-for="m in list" :key="m.key + m.who" class="card-mem" :class="m.who" @click="open(m.key)">
        <img v-if="m.note.img" :src="m.note.img" alt="" loading="lazy" />
        <div v-else class="text-only">{{ m.note.text }}</div>
        <span class="cap">{{ m.note.title || 'Sin título' }}</span>
        <span class="by">
          <i class="dot" :class="m.who" />{{ nameOf(m.who) }} · {{ dayMonth(m.key) }}{{ fromKey(m.key).getFullYear() !== new Date().getFullYear() ? ', ' + fromKey(m.key).getFullYear() : '' }}
          <b v-if="m.note.loved" class="h">♥</b>
        </span>
      </button>
    </TransitionGroup>

    <div v-else class="empty">
      <p>{{ q ? 'No encontramos notas con esas palabras' : 'Aún no hay notas aquí' }}</p>
    </div>
  </div>
</template>

<style scoped>
header h1 { margin: 0; font: 600 30px var(--f-display); }
header p { margin: 2px 0 16px; font: 700 22px var(--f-script); color: var(--muted); }
.search { display: flex; align-items: center; gap: 10px; background: #fff; border: 2px solid var(--line); border-radius: 18px; height: 52px; padding: 0 16px; color: var(--muted); }
.search:focus-within { border-color: var(--ella); }
.search input { flex: 1; border: 0; outline: none; background: transparent; font-size: 16px; min-width: 0; }
.filters { display: flex; gap: 8px; margin: 14px 0 20px; overflow-x: auto; scrollbar-width: none; }
.filters button { flex: none; display: flex; align-items: center; gap: 6px; height: 40px; padding: 0 14px; border-radius: 99px; border: 2px solid var(--line); background: #fff; font: 600 14px var(--f-display); color: var(--ink-2); }
.filters button.on { background: var(--ink); border-color: var(--ink); color: #fff; }
.h { color: var(--ella); }

.grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; }
.card-mem { border: 0; text-align: left; background: #fff; padding: 8px 8px 12px; border-radius: 8px; box-shadow: 0 10px 22px -14px rgba(74, 63, 85, .6); transition: transform .2s; min-width: 0; }
.card-mem:hover { transform: translateY(-3px) rotate(-.5deg); }
.card-mem img, .text-only { display: block; width: 100%; aspect-ratio: 1; object-fit: cover; border-radius: 4px; }
.text-only { padding: 12px; overflow: hidden; font: 18px/1.3 var(--f-hand); color: var(--ink-2); display: -webkit-box; -webkit-line-clamp: 6; -webkit-box-orient: vertical; }
.card-mem.ella .text-only { background: var(--ella-soft); }
.card-mem.el .text-only { background: var(--el-soft); }
.cap { display: block; margin: 8px 2px 0; font: 700 22px/1.05 var(--f-script); color: var(--ink); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.by { display: flex; align-items: center; gap: 5px; margin: 4px 2px 0; font-size: 11px; font-weight: 800; color: var(--muted); }
.by .dot { width: 7px; height: 7px; }
.by .h { margin-left: auto; }
.empty { text-align: center; padding: 60px 20px; font: 22px var(--f-hand); color: var(--muted); }

.list-enter-active, .list-leave-active { transition: opacity .2s, transform .2s; }
.list-enter-from, .list-leave-to { opacity: 0; transform: scale(.96); }

@media (min-width: 640px) { .grid { grid-template-columns: repeat(3, 1fr); } }
@media (min-width: 1024px) {
  .mem { height: 100dvh; overflow-y: auto; padding: 32px 40px 60px; }
  header h1 { font-size: 36px; }
  .search { max-width: 520px; }
  .grid { grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 22px; }
}
</style>
