<script setup>
import { computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import AppIcon from '@/components/AppIcon.vue'
import { state, dayNotes, favoriteDays, toggleFavorite, loadDays } from '@/store/diary'
import { dayMonth, weekday, fromKey } from '@/lib/dates'

const router = useRouter()
watch(favoriteDays, keys => loadDays(keys).catch(() => {}), { immediate: true })

const cards = computed(() =>
  favoriteDays.value.map(key => {
    const notes = dayNotes(key)
    const authors = ['ella', 'el'].filter(w => notes[w])
    return {
      key,
      authors,
      photos: authors.map(w => notes[w].thumb).filter(Boolean),
      titles: authors.map(w => ({ who: w, text: notes[w].title || notes[w].text })).filter(t => t.text),
      year: fromKey(key).getFullYear()
    }
  })
)

const open = key => router.push({ path: '/', query: { dia: key } })
</script>

<template>
  <div class="favs">
    <header>
      <h1>Días favoritos</h1>
      <p>{{ cards.length }} {{ cards.length === 1 ? 'día especial' : 'días especiales' }}</p>
    </header>

    <TransitionGroup v-if="cards.length" name="list" tag="div" class="grid">
      <article v-for="c in cards" :key="c.key" class="card-day">
        <button class="body" :aria-label="`Abrir el ${dayMonth(c.key)}`" @click="open(c.key)">
          <span v-if="c.photos.length" class="imgs">
            <img v-for="(src, i) in c.photos" :key="i" :src="src" alt="" loading="lazy" />
          </span>
          <span v-else class="no-photo"><AppIcon name="starfill" :size="40" /></span>

          <span class="date">
            <small>{{ weekday(c.key) }}</small>
            {{ dayMonth(c.key) }}<template v-if="c.year !== new Date().getFullYear()">, {{ c.year }}</template>
          </span>

          <span v-for="t in c.titles" :key="t.who" class="line">
            <i class="dot" :class="t.who" /><span>{{ t.text }}</span>
          </span>
          <span v-if="!c.authors.length" class="line muted">Sin notas todavía</span>
        </button>

        <button class="icon-btn unfav" :aria-label="`Quitar ${dayMonth(c.key)} de favoritos`" title="Quitar de favoritos" @click="toggleFavorite(c.key)">
          <AppIcon name="starfill" />
        </button>
      </article>
    </TransitionGroup>

    <div v-else-if="state.favoritesReady" class="empty">
      <AppIcon name="star" :size="40" />
      <p>Aún no tienen días favoritos</p>
      <small>Abre un día del calendario y toca la estrella para guardarlo aquí</small>
    </div>
  </div>
</template>

<style scoped>
header h1 { margin: 0; font: 600 30px var(--f-display); }
header p { margin: 2px 0 20px; font: 700 22px var(--f-script); color: var(--muted); }

.grid { display: grid; grid-template-columns: 1fr; gap: 18px; }
.card-day { position: relative; background: var(--paper); border-radius: var(--radius-card); box-shadow: var(--shadow-card); overflow: hidden; border-top: 6px solid var(--honey); transition: transform .2s; }
.card-day:hover { transform: translateY(-3px); }
.body { display: block; width: 100%; border: 0; padding: 0 0 16px; background: transparent; text-align: left; }
.imgs, .no-photo { display: flex; width: 100%; aspect-ratio: 16 / 10; background: var(--sand); }
.imgs img { flex: 1; min-width: 0; height: 100%; object-fit: cover; }
.imgs img + img { border-left: 3px solid #fff; }
.no-photo { align-items: center; justify-content: center; background: #FFF3D6; color: var(--honey); }
.date { display: block; margin: 12px 16px 6px; font: 600 22px/1.15 var(--f-display); }
.date small { display: block; font: 700 20px var(--f-script); color: var(--muted); }
.line { display: flex; align-items: center; gap: 8px; margin: 4px 16px 0; font: 18px/1.3 var(--f-hand); color: var(--ink-2); }
.line span { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.line .dot { width: 8px; height: 8px; }
.line.muted { color: var(--muted); }
.unfav { position: absolute; top: 10px; right: 10px; background: rgba(255, 255, 255, .92); color: var(--honey); box-shadow: 0 4px 10px -4px rgba(0, 0, 0, .3); }
.unfav:hover:not(:disabled) { background: #fff; }

.empty { text-align: center; padding: 60px 20px; color: var(--muted); }
.empty :deep(svg) { margin: 0 auto 8px; color: var(--honey); }
.empty p { margin: 0; font: 22px var(--f-hand); }
.empty small { font-weight: 700; }

.list-enter-active, .list-leave-active { transition: opacity .2s, transform .2s; }
.list-enter-from, .list-leave-to { opacity: 0; transform: scale(.96); }

@media (min-width: 640px) { .grid { grid-template-columns: repeat(2, 1fr); } }
@media (min-width: 1024px) {
  .favs { height: 100dvh; overflow-y: auto; padding: 32px 40px 60px; }
  header h1 { font-size: 36px; }
  .grid { grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 22px; }
}
</style>
