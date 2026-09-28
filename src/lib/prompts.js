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

export const MOODS = {
  ella: ['Feliz', 'Tranqui', 'Cansada', 'Te extraño'],
  el: ['Feliz', 'Tranqui', 'Cansado', 'Te extraño']
}
