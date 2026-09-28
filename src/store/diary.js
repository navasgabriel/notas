import { reactive, computed } from 'vue'
import { get, set, del } from 'idb-keyval'
import { toKey, todayKey } from '@/lib/dates'
import { scene } from '@/lib/scene'

/**
 * Estado de la app. Sin base de datos por ahora: todo se guarda en
 * IndexedDB del navegador. Cuando exista API, solo cambia `persist` / `load`.
 *
 * notes = { 'YYYY-MM-DD': { ella?: Note, el?: Note } }
 * Note  = { title, text, img, mood, loved, createdAt, updatedAt }
 */
export const state = reactive({
  ready: false,
  session: null, // { email, who: 'ella' | 'el' }
  couple: { ella: 'Yorbelis', el: 'Gabriel', since: null },
  notes: {},
  toast: null
})

const plain = v => JSON.parse(JSON.stringify(v))
const persist = key => set(key, plain(state[key])).catch(() => showToast('No se pudo guardar en este navegador'))

export async function load() {
  const [session, couple, notes, seed] = await Promise.all([get('session'), get('couple'), get('notes'), get('seed')])
  state.session = session ?? null
  if (couple) state.couple = couple
  // Si cambian los datos de ejemplo, se vuelven a sembrar.
  if (notes && seed === SEED_VERSION) state.notes = notes
  else seedDemo()
  state.ready = true
}

// ---------- sesión ----------
export function login(email, who) {
  state.session = { email, who }
  persist('session')
}

export function logout() {
  state.session = null
  del('session')
}

export function switchWho() {
  state.session.who = partnerOf(state.session.who)
  persist('session')
}

// ---------- pareja ----------
export const partnerOf = who => (who === 'ella' ? 'el' : 'ella')
export const nameOf = who => state.couple[who] || (who === 'ella' ? 'Ella' : 'Él')
export const initialOf = who => nameOf(who).charAt(0).toUpperCase()

export const me = computed(() => state.session?.who ?? 'ella')
export const partner = computed(() => partnerOf(me.value))

export function updateCouple(patch) {
  Object.assign(state.couple, patch)
  persist('couple')
}

// ---------- notas ----------
export const dayNotes = key => state.notes[key] ?? {}

export function saveNote(key, who, data) {
  const now = Date.now()
  const day = state.notes[key] ?? (state.notes[key] = {})
  const prev = day[who]
  day[who] = { loved: false, createdAt: now, ...prev, ...data, updatedAt: now }
  persist('notes')
}

export function deleteNote(key, who) {
  const day = state.notes[key]
  if (!day) return
  delete day[who]
  if (!day.ella && !day.el) delete state.notes[key]
  persist('notes')
}

export function toggleLove(key, who) {
  const note = state.notes[key]?.[who]
  if (!note) return
  note.loved = !note.loved
  persist('notes')
}

/** Todas las notas con foto, de la más reciente a la más vieja. */
export const memories = computed(() =>
  Object.entries(state.notes)
    .flatMap(([key, day]) => ['ella', 'el'].filter(w => day[w]).map(who => ({ key, who, note: day[who] })))
    .sort((a, b) => (a.key < b.key ? 1 : a.key > b.key ? -1 : a.who === 'ella' ? -1 : 1))
)

export const writtenCount = computed(() => memories.value.length)

// ---------- avisos ----------
let toastTimer
export function showToast(msg) {
  state.toast = msg
  clearTimeout(toastTimer)
  toastTimer = setTimeout(() => (state.toast = null), 2600)
}

// ---------- datos de ejemplo ----------
const SEED_VERSION = 3

// Solo tres días de ejemplo, relativos a hoy: [días atrás, nota de ella, nota de él]
const SAMPLE = [
  [2,
    { title: 'Tarde de helado y caminata', text: 'Salimos sin plan y terminamos caminando hasta el parque. Me reí muchísimo cuando se te cayó la bola de chocolate. Gracias por hacer que un día cualquiera se sintiera especial.', mood: 'Feliz', img: 'meadow', loved: true },
    { title: 'Tu risa en el parque', text: 'Lo mejor del día fue verte feliz con tu helado de fresa. Me prometí traerte otra vez cuando empiece el frío. Te quiero más que al chocolate, y eso ya es mucho.', mood: 'Feliz', img: 'sunset' }],
  [5,
    { title: 'Domingo de cobijas', text: 'Llovió todo el día y vimos tres películas seguidas. Hiciste palomitas con demasiada mantequilla, justo como me gustan.', mood: 'Tranqui', img: 'lav' },
    null],
  [9,
    null,
    { title: 'Atardecer', text: 'Nos quedamos viendo el cielo naranja sin decir nada. No hacía falta.', mood: 'Tranqui', img: 'beach', loved: true }]
]

function seedDemo() {
  const today = new Date()
  const notes = {}
  for (const [ago, ella, el] of SAMPLE) {
    const d = new Date(today.getFullYear(), today.getMonth(), today.getDate() - ago)
    const at = d.getTime() + 21 * 3600000
    const day = {}
    if (ella) day.ella = { loved: false, ...ella, img: scene(ella.img), createdAt: at, updatedAt: at }
    if (el) day.el = { loved: false, ...el, img: scene(el.img), createdAt: at + 3600000, updatedAt: at + 3600000 }
    notes[toKey(d)] = day
  }
  state.notes = notes
  state.couple = {
    ella: 'Yorbelis',
    el: 'Gabriel',
    since: toKey(new Date(today.getFullYear() - 1, today.getMonth() - 1, today.getDate()))
  }
  persist('notes')
  persist('couple')
  set('seed', SEED_VERSION)
}

export function resetDemo() {
  seedDemo()
  showToast('Datos de ejemplo restaurados')
}

export function clearNotes() {
  state.notes = {}
  persist('notes')
  showToast('Diario vacío, listo para estrenar')
}

export { todayKey }
