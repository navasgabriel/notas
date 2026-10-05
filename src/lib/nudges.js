import { dayMonth, todayKey } from './dates'

/** Avisos que se mandan a mano desde el botón de la cabecera. */
export const NUDGES = [
  { type: 'love', emoji: '❤️', label: 'Te quiero' },
  { type: 'kiss', emoji: '😘', label: 'Un beso' },
  { type: 'hug', emoji: '🤗', label: 'Un abrazo' },
  { type: 'miss', emoji: '🥺', label: 'Te extraño' },
  { type: 'write', emoji: '✍️', label: 'Escribe tu nota de hoy' }
]

/**
 * Texto que ve quien recibe el aviso. `from` es el nombre de quien lo manda.
 * 'loved', 'wrote' y 'favorite' son automáticos: corazón a una nota, nota escrita y día favorito.
 */
export function describeNudge({ type, date }, from) {
  const day = !date || date === todayKey() ? 'de hoy' : `del ${dayMonth(date)}`
  switch (type) {
    case 'love': return { emoji: '❤️', text: `${from} te dice: te quiero` }
    case 'kiss': return { emoji: '😘', text: `${from} te manda un beso` }
    case 'hug': return { emoji: '🤗', text: `${from} te manda un abrazo` }
    case 'miss': return { emoji: '🥺', text: `${from} te extraña` }
    case 'write': return { emoji: '✍️', text: `${from} quiere leer tu nota de hoy` }
    case 'loved': return { emoji: '💖', text: `A ${from} le encantó tu nota ${day}` }
    case 'favorite': return { emoji: '⭐', text: `${from} marcó el ${dayMonth(date)} como día favorito` }
    case 'wrote': return { emoji: '📝', text: `${from} escribió su nota ${day}` }
    default: return { emoji: '💌', text: `${from} te mandó algo` }
  }
}
