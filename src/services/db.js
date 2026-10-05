import {
  collection, doc, getDoc, getDocs, setDoc, deleteDoc, updateDoc,
  query, where, orderBy, limit as qLimit, runTransaction, writeBatch, serverTimestamp
} from 'firebase/firestore'
import bcrypt from 'bcryptjs'
import { db } from './firebase'
import { resizeDataUrl } from '@/lib/image'

/*
 * Colecciones
 * ─────────────────────────────────────────────────────────────────────────────
 * users/{userId}
 *   email, name, role ('ella' | 'el'), passwordHash, coupleId, createdAt, updatedAt
 *
 * couples/{coupleId}
 *   names { ella, el }, members { ella: userId|null, el: userId|null },
 *   since ('YYYY-MM-DD'), inviteCode, createdAt, updatedAt
 *
 * couples/{coupleId}/notes/{YYYY-MM-DD_role}      ← el calendario sale de aquí
 *   date, month ('YYYY-MM'), role, authorId, title, text, mood,
 *   thumb (miniatura ~240px), hasPhoto, loved, createdAt, updatedAt
 *
 * couples/{coupleId}/photos/{YYYY-MM-DD_role}     ← foto completa, se pide solo al abrir el día
 *   data (dataURL jpeg), updatedAt
 *
 * couples/{coupleId}/favorites/{YYYY-MM-DD}       ← si existe, el día es favorito
 *   date, by (userId), createdAt
 *
 * invites/{code}
 *   coupleId, role (el lugar libre), createdBy, createdAt, usedBy, usedAt
 *
 * La foto va aparte para que cargar un mes del calendario solo traiga miniaturas.
 * Un documento de Firestore no puede pasar de 1 MB: la foto completa se guarda comprimida.
 */

const SALT_ROUNDS = 10
const MAX_PHOTO_BYTES = 900_000

const users = collection(db, 'users')
const couples = collection(db, 'couples')
const notesOf = coupleId => collection(db, 'couples', coupleId, 'notes')
const photosOf = coupleId => collection(db, 'couples', coupleId, 'photos')
const favoritesOf = coupleId => collection(db, 'couples', coupleId, 'favorites')

export const noteId = (date, role) => `${date}_${role}`
const normalizeEmail = email => email.trim().toLowerCase()
const withId = snap => (snap.exists() ? { id: snap.id, ...snap.data() } : null)
const publicUser = u => { if (!u) return null; const { passwordHash, ...rest } = u; return rest }

export class ServiceError extends Error {
  constructor(code, message) { super(message); this.code = code }
}

// ════════════════════════════ USUARIOS ════════════════════════════

export async function getUserByEmail(email) {
  const snap = await getDocs(query(users, where('email', '==', normalizeEmail(email)), qLimit(1)))
  return snap.empty ? null : withId(snap.docs[0])
}

export async function getUser(userId) {
  return publicUser(withId(await getDoc(doc(users, userId))))
}

/**
 * Crea la cuenta. Sin `inviteCode` crea también la pareja (y su código de invitación);
 * con `inviteCode` se une a la pareja existente y toma el lugar libre.
 */
export async function register({ email, password, name, role, inviteCode }) {
  email = normalizeEmail(email)
  if (password.length < 6) throw new ServiceError('weak-password', 'La contraseña debe tener al menos 6 caracteres')
  if (await getUserByEmail(email)) throw new ServiceError('email-taken', 'Ese correo ya está registrado')

  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS)
  const userRef = doc(users)

  if (inviteCode) {
    const code = inviteCode.trim().toUpperCase()
    await runTransaction(db, async tx => {
      const invRef = doc(db, 'invites', code)
      const inv = await tx.get(invRef)
      if (!inv.exists() || inv.data().usedBy) throw new ServiceError('invalid-invite', 'El código de invitación no es válido')
      const { coupleId, role: freeRole } = inv.data()
      const coupleRef = doc(couples, coupleId)
      tx.set(userRef, { email, name, role: freeRole, passwordHash, coupleId, createdAt: serverTimestamp(), updatedAt: serverTimestamp() })
      tx.update(coupleRef, { [`members.${freeRole}`]: userRef.id, [`names.${freeRole}`]: name, updatedAt: serverTimestamp() })
      tx.update(invRef, { usedBy: userRef.id, usedAt: serverTimestamp() })
    })
  } else {
    const other = role === 'ella' ? 'el' : 'ella'
    const coupleRef = doc(couples)
    const code = await uniqueInviteCode()
    const batch = writeBatch(db)
    batch.set(userRef, { email, name, role, passwordHash, coupleId: coupleRef.id, createdAt: serverTimestamp(), updatedAt: serverTimestamp() })
    batch.set(coupleRef, {
      names: { [role]: name, [other]: '' },
      members: { [role]: userRef.id, [other]: null },
      since: null,
      inviteCode: code,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    })
    batch.set(doc(db, 'invites', code), { coupleId: coupleRef.id, role: other, createdBy: userRef.id, createdAt: serverTimestamp(), usedBy: null, usedAt: null })
    await batch.commit()
  }
  return getUser(userRef.id)
}

/** Devuelve el usuario (sin hash) si correo y contraseña coinciden. */
export async function login(email, password) {
  const user = await getUserByEmail(email)
  if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
    throw new ServiceError('invalid-credentials', 'Correo o contraseña incorrectos')
  }
  return publicUser(user)
}

export async function updateUser(userId, patch) {
  const { passwordHash, email, coupleId, role, ...allowed } = patch
  await updateDoc(doc(users, userId), { ...allowed, updatedAt: serverTimestamp() })
  if (allowed.name) {
    const u = await getUser(userId)
    if (u?.coupleId) await updateDoc(doc(couples, u.coupleId), { [`names.${u.role}`]: allowed.name, updatedAt: serverTimestamp() })
  }
  return getUser(userId)
}

export async function changePassword(userId, currentPassword, newPassword) {
  const snap = await getDoc(doc(users, userId))
  if (!snap.exists() || !(await bcrypt.compare(currentPassword, snap.data().passwordHash))) {
    throw new ServiceError('invalid-credentials', 'La contraseña actual no es correcta')
  }
  if (newPassword.length < 6) throw new ServiceError('weak-password', 'La contraseña debe tener al menos 6 caracteres')
  await updateDoc(doc(users, userId), { passwordHash: await bcrypt.hash(newPassword, SALT_ROUNDS), updatedAt: serverTimestamp() })
}

/** Borra la cuenta y libera su lugar en la pareja (las notas de la pareja se conservan). */
export async function deleteUser(userId) {
  const u = await getUser(userId)
  if (!u) return
  const batch = writeBatch(db)
  batch.delete(doc(users, userId))
  if (u.coupleId) batch.update(doc(couples, u.coupleId), { [`members.${u.role}`]: null, updatedAt: serverTimestamp() })
  await batch.commit()
}

// ════════════════════════════ PAREJAS ════════════════════════════

export async function getCouple(coupleId) {
  return withId(await getDoc(doc(couples, coupleId)))
}

/** names: { ella, el } · since: 'YYYY-MM-DD' */
export async function updateCouple(coupleId, { names, since }) {
  const patch = { updatedAt: serverTimestamp() }
  if (names?.ella !== undefined) patch['names.ella'] = names.ella
  if (names?.el !== undefined) patch['names.el'] = names.el
  if (since !== undefined) patch.since = since
  await updateDoc(doc(couples, coupleId), patch)
  return getCouple(coupleId)
}

async function uniqueInviteCode() {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  for (;;) {
    const code = Array.from(crypto.getRandomValues(new Uint8Array(6)), n => alphabet[n % alphabet.length]).join('')
    if (!(await getDoc(doc(db, 'invites', code))).exists()) return code
  }
}

// ════════════════════════════ NOTAS ════════════════════════════

/** Notas de un mes para pintar el calendario (solo miniaturas). month: 'YYYY-MM' */
export async function getNotesByMonth(coupleId, month) {
  const snap = await getDocs(query(notesOf(coupleId), where('month', '==', month)))
  return snap.docs.map(withId)
}

/** Las dos notas de un día: { ella, el } */
export async function getDay(coupleId, date) {
  const snap = await getDocs(query(notesOf(coupleId), where('date', '==', date)))
  const day = {}
  snap.docs.forEach(d => (day[d.data().role] = withId(d)))
  return day
}

export async function getNote(coupleId, date, role) {
  return withId(await getDoc(doc(notesOf(coupleId), noteId(date, role))))
}

/** Recuerdos: notas más recientes primero. */
export async function listNotes(coupleId, { max = 60 } = {}) {
  const snap = await getDocs(query(notesOf(coupleId), orderBy('date', 'desc'), qLimit(max)))
  return snap.docs.map(withId)
}

/**
 * Crea o actualiza la nota de `role` en `date`.
 * `img`: dataURL nuevo · `null` quita la foto · `undefined` la deja igual.
 */
export async function saveNote(coupleId, { date, role, authorId, title = '', text = '', mood = '', img }) {
  const id = noteId(date, role)
  const ref = doc(notesOf(coupleId), id)
  const prev = await getDoc(ref)

  const data = {
    date, month: date.slice(0, 7), role, authorId,
    title: title.trim(), text: text.trim(), mood,
    updatedAt: serverTimestamp()
  }
  if (!prev.exists()) Object.assign(data, { loved: false, hasPhoto: false, thumb: null, createdAt: serverTimestamp() })

  const batch = writeBatch(db)
  if (img) {
    if (img.length > MAX_PHOTO_BYTES) throw new ServiceError('photo-too-big', 'La foto es muy pesada, intenta con otra')
    Object.assign(data, { hasPhoto: true, thumb: await resizeDataUrl(img, 360) })
    batch.set(doc(photosOf(coupleId), id), { data: img, updatedAt: serverTimestamp() })
  } else if (img === null) {
    Object.assign(data, { hasPhoto: false, thumb: null })
    batch.delete(doc(photosOf(coupleId), id))
  }
  batch.set(ref, data, { merge: true })
  await batch.commit()
  return getNote(coupleId, date, role)
}

export async function deleteNote(coupleId, date, role) {
  const id = noteId(date, role)
  const batch = writeBatch(db)
  batch.delete(doc(notesOf(coupleId), id))
  batch.delete(doc(photosOf(coupleId), id))
  await batch.commit()
}

/** El corazón que le da la pareja a la nota. */
export async function setLoved(coupleId, date, role, loved) {
  await updateDoc(doc(notesOf(coupleId), noteId(date, role)), { loved, updatedAt: serverTimestamp() })
}

/** Foto completa (se pide al abrir el día o el visor). */
export async function getPhoto(coupleId, date, role) {
  const snap = await getDoc(doc(photosOf(coupleId), noteId(date, role)))
  return snap.exists() ? snap.data().data : null
}

// ════════════════════════════ DÍAS FAVORITOS ════════════════════════════

/** Todos los días favoritos de la pareja, el más reciente primero. */
export async function listFavorites(coupleId) {
  const snap = await getDocs(query(favoritesOf(coupleId), orderBy('date', 'desc')))
  return snap.docs.map(withId)
}

export async function setFavorite(coupleId, date, by, favorite) {
  const ref = doc(favoritesOf(coupleId), date)
  if (favorite) await setDoc(ref, { date, by, createdAt: serverTimestamp() })
  else await deleteDoc(ref)
}

// ════════════════════════════ INVITACIONES ════════════════════════════

export async function getInvite(code) {
  return withId(await getDoc(doc(db, 'invites', code.trim().toUpperCase())))
}

/** Genera un código nuevo (p. ej. si la pareja perdió el anterior). */
export async function renewInvite(coupleId, createdBy) {
  const couple = await getCouple(coupleId)
  const free = ['ella', 'el'].find(r => !couple.members[r])
  if (!free) throw new ServiceError('couple-full', 'La pareja ya está completa')
  const code = await uniqueInviteCode()
  const batch = writeBatch(db)
  if (couple.inviteCode) batch.delete(doc(db, 'invites', couple.inviteCode))
  batch.set(doc(db, 'invites', code), { coupleId, role: free, createdBy, createdAt: serverTimestamp(), usedBy: null, usedAt: null })
  batch.update(doc(couples, coupleId), { inviteCode: code, updatedAt: serverTimestamp() })
  await batch.commit()
  return code
}
