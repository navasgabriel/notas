export const MONTHS = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre']
export const WEEKDAYS = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado']
export const WEEKDAYS_SHORT = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']

const pad = n => String(n).padStart(2, '0')

/** Clave local 'YYYY-MM-DD' (sin zona horaria, para no brincar de día). */
export const toKey = d => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`

export function fromKey(key) {
  const [y, m, d] = key.split('-').map(Number)
  return new Date(y, m - 1, d)
}

export const todayKey = () => toKey(new Date())

export const capitalize = s => s.charAt(0).toUpperCase() + s.slice(1)

/** "23 de septiembre" */
export function dayMonth(key) {
  const d = fromKey(key)
  return `${d.getDate()} de ${MONTHS[d.getMonth()]}`
}

/** "miércoles" */
export const weekday = key => WEEKDAYS[fromKey(key).getDay()]

/** "23 sep" */
export function shortDate(key) {
  const d = fromKey(key)
  return `${d.getDate()} ${MONTHS[d.getMonth()].slice(0, 3)}`
}

export function timeOf(ts) {
  return new Date(ts).toLocaleTimeString('es', { hour: 'numeric', minute: '2-digit' })
}

export function daysBetween(fromKeyStr, toKeyStr = todayKey()) {
  return Math.round((fromKey(toKeyStr) - fromKey(fromKeyStr)) / 86400000)
}

/** Celdas del mes: null para los huecos antes del día 1 (semana inicia en domingo). */
export function monthCells(year, month) {
  const first = new Date(year, month, 1).getDay()
  const days = new Date(year, month + 1, 0).getDate()
  const cells = Array(first).fill(null)
  for (let d = 1; d <= days; d++) cells.push(toKey(new Date(year, month, d)))
  return cells
}
