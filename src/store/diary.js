import { reactive, computed } from 'vue'
import * as api from '@/services/db'

/**
 * Estado de la app, respaldado por Firestore (src/services/db.js).
 *
 * notes  = { 'YYYY-MM-DD': { ella?: Note, el?: Note } }   ← caché de lo ya cargado
 * Note   = { title, text, mood, thumb, hasPhoto, loved, createdAt (ms), updatedAt (ms) }
 * photos = { 'YYYY-MM-DD_role': dataURL }                ← fotos completas ya pedidas
 */
export const state = reactive({
  ready: false,
  session: null, // { userId, email, name, who, coupleId }
  couple: { ella: '', el: '', since: null, inviteCode: null, members: { ella: null, el: null } },
  notes: {},
  photos: {},
  loadedMonths: {},
  toast: null
})

const SESSION_KEY = 'nuestros-dias.session'
const ms = t => (t?.toMillis ? t.toMillis() : typeof t === 'number' ? t : Date.now())

function readSession() {
  try { return JSON.parse(localStorage.getItem(SESSION_KEY)) } catch { return null }
}
function writeSession(s) {
  try { s ? localStorage.setItem(SESSION_KEY, JSON.stringify(s)) : localStorage.removeItem(SESSION_KEY) } catch { /* modo privado */ }
}

/** Ejecuta una llamada al servicio mostrando un aviso si falla. */
async function guard(fn, fallbackMsg = 'No pudimos conectar, intenta de nuevo') {
  try { return await fn() }
  catch (e) {
    const known = e instanceof api.ServiceError
    showToast(known ? e.message : fallbackMsg)
    if (!known) console.error(e)
    throw e
  }
}

// ---------- arranque ----------
export async function load() {
  const saved = readSession()
  if (saved?.userId) {
    try { await startSession(saved.userId) }
    catch (e) { console.error(e); if (!state.session) writeSession(null) }
  }
  state.ready = true
}

async function startSession(userId) {
  const user = await api.getUser(userId)
  if (!user) throw new Error('Usuario no encontrado')
  state.session = { userId: user.id, email: user.email, name: user.name, who: user.role, coupleId: user.coupleId }
  writeSession(state.session)
  state.notes = {}
  state.photos = {}
  state.loadedMonths = {}
  await Promise.all([refreshCouple(), loadRecent()])
}

// ---------- sesión ----------
export async function login(email, password) {
  const user = await guard(() => api.login(email, password))
  await startSession(user.id)
}

export async function register(data) {
  const user = await guard(() => api.register(data))
  await startSession(user.id)
}

export function logout() {
  state.session = null
  state.notes = {}
  state.photos = {}
  state.loadedMonths = {}
  writeSession(null)
}

// ---------- pareja ----------
export const partnerOf = who => (who === 'ella' ? 'el' : 'ella')
export const nameOf = who => state.couple[who] || (who === 'ella' ? 'Ella' : 'Él')
export const initialOf = who => nameOf(who).charAt(0).toUpperCase()

export const me = computed(() => state.session?.who ?? 'ella')
export const partner = computed(() => partnerOf(me.value))
export const partnerJoined = computed(() => !!state.couple.members?.[partner.value])

export async function refreshCouple() {
  const c = await api.getCouple(state.session.coupleId)
  if (!c) return
  state.couple = { ella: c.names?.ella ?? '', el: c.names?.el ?? '', since: c.since ?? null, inviteCode: c.inviteCode ?? null, members: c.members ?? {} }
}

export async function updateCouple(patch) {
  const { since, ...names } = patch
  Object.assign(state.couple, patch)
  await guard(() => api.updateCouple(state.session.coupleId, { names, since }))
  if (names[me.value]) state.session.name = names[me.value]
}

export async function renewInvite() {
  const code = await guard(() => api.renewInvite(state.session.coupleId, state.session.userId))
  state.couple.inviteCode = code
  return code
}

// ---------- notas ----------
export const dayNotes = key => state.notes[key] ?? {}

function putNote(n) {
  const day = state.notes[n.date] ?? (state.notes[n.date] = {})
  day[n.role] = {
    title: n.title ?? '', text: n.text ?? '', mood: n.mood ?? '',
    thumb: n.thumb ?? null, hasPhoto: !!n.hasPhoto, loved: !!n.loved,
    createdAt: ms(n.createdAt), updatedAt: ms(n.updatedAt)
  }
}

function dropNote(key, who) {
  const day = state.notes[key]
  if (!day) return
  delete day[who]
  if (!day.ella && !day.el) delete state.notes[key]
  delete state.photos[`${key}_${who}`]
}

/** Carga (una vez) las notas de un mes del calendario. month: 0-11 */
export async function loadMonth(year, month) {
  const m = `${year}-${String(month + 1).padStart(2, '0')}`
  if (!state.session || state.loadedMonths[m]) return
  state.loadedMonths[m] = true
  try { (await api.getNotesByMonth(state.session.coupleId, m)).forEach(putNote) }
  catch (e) { state.loadedMonths[m] = false; console.error(e) }
}

/** Notas recientes (para Recuerdos). */
export async function loadRecent(max = 120) {
  if (!state.session) return
  ;(await api.listNotes(state.session.coupleId, { max })).forEach(putNote)
}

/** Foto completa; mientras llega se muestra la miniatura. */
export async function loadPhoto(key, who) {
  const id = `${key}_${who}`
  if (state.photos[id] || !dayNotes(key)[who]?.hasPhoto) return state.photos[id] ?? null
  const data = await api.getPhoto(state.session.coupleId, key, who)
  if (data) state.photos[id] = data
  return data
}

/** img: dataURL nuevo · null quita la foto · undefined no la toca */
export async function saveNote(key, who, { title, text, mood, img }) {
  const saved = await guard(() =>
    api.saveNote(state.session.coupleId, { date: key, role: who, authorId: state.session.userId, title, text, mood, img })
  )
  putNote(saved)
  if (img) state.photos[`${key}_${who}`] = img
  if (img === null) delete state.photos[`${key}_${who}`]
}

export async function deleteNote(key, who) {
  await guard(() => api.deleteNote(state.session.coupleId, key, who))
  dropNote(key, who)
}

export async function toggleLove(key, who) {
  const note = state.notes[key]?.[who]
  if (!note) return
  note.loved = !note.loved
  try { await api.setLoved(state.session.coupleId, key, who, note.loved) }
  catch (e) { note.loved = !note.loved; showToast('No se pudo guardar el corazón'); console.error(e) }
}

/** Todas las notas cargadas, de la más reciente a la más vieja. */
export const memories = computed(() =>
  Object.entries(state.notes)
    .flatMap(([key, day]) => ['ella', 'el'].filter(w => day[w]).map(who => ({ key, who, note: day[who] })))
    .sort((a, b) => (a.key < b.key ? 1 : a.key > b.key ? -1 : a.who === 'ella' ? -1 : 1))
)

// ---------- avisos ----------
let toastTimer
export function showToast(msg) {
  state.toast = msg
  clearTimeout(toastTimer)
  toastTimer = setTimeout(() => (state.toast = null), 2800)
}
