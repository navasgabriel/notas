import { useRouter } from 'vue-router'
import { dayNotes, me } from '@/store/diary'
import { todayKey } from '@/lib/dates'

/** Botón "hoy": si ya escribiste abre el día, si no abre el editor. */
export function useOpenToday() {
  const router = useRouter()
  return () => {
    const dia = todayKey()
    const written = !!dayNotes(dia)[me.value]
    router.push({ path: '/', query: written ? { dia } : { dia, escribir: '1' } })
  }
}
