export const PROMPTS = [
  '¿Ayudaste a alguien hoy o alguien te ayudó a ti?',
  '¿Qué fue lo que más te hizo sonreír hoy?',
  '¿Qué momento de hoy quisieras volver a vivir?',
  '¿Qué te gustaría decirle y no le dijiste?',
  '¿Qué aprendiste hoy de ti o de tu pareja?',
  '¿Qué pequeña cosa hizo tu día más bonito?',
  '¿Qué agradeces de hoy?',
  '¿Qué canción describiría tu día?',
  'Cuéntale algo que viste hoy y te recordó a él o a ella.'
]

export const randomPrompt = (except) => {
  const pool = PROMPTS.filter(p => p !== except)
  return pool[Math.floor(Math.random() * pool.length)]
}

/** Cuántas emociones puede elegir cada persona en su nota. */
export const MAX_MOODS = 3

// El texto (label) es lo que se guarda en la nota; el emoji solo se muestra.
const mood = (emoji, ella, el = ella) => ({ emoji, ella, el })
const MOOD_LIST = [
  mood('😊', 'Feliz'),
  mood('😌', 'Tranqui'),
  mood('😍', 'Enamorada', 'Enamorado'),
  mood('🙏', 'Agradecida', 'Agradecido'),
  mood('🤩', 'Emocionada', 'Emocionado'),
  mood('😕', 'Confundida', 'Confundido'),
  mood('😴', 'Cansada', 'Cansado'),
  mood('😢', 'Triste'),
  mood('🥺', 'Te extraño'),
  mood('🤗', 'Necesito un abrazo'),
  mood('😈', 'Quiero sexo'),
  mood('🔥', 'Hot')
]

export const MOODS = {
  ella: MOOD_LIST.map(m => ({ label: m.ella, emoji: m.emoji })),
  el: MOOD_LIST.map(m => ({ label: m.el, emoji: m.emoji }))
}

const EMOJI = Object.fromEntries(MOOD_LIST.flatMap(m => [[m.ella, m.emoji], [m.el, m.emoji]]))
/** Emoji de un estado de ánimo guardado ('' si no se conoce). */
export const moodEmoji = label => EMOJI[label] ?? ''
