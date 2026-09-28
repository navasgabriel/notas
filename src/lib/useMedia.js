import { ref, onMounted, onBeforeUnmount } from 'vue'

export function useMedia(query) {
  const mql = window.matchMedia(query)
  const matches = ref(mql.matches)
  const update = e => (matches.value = e.matches)
  onMounted(() => mql.addEventListener('change', update))
  onBeforeUnmount(() => mql.removeEventListener('change', update))
  return matches
}

export const DESKTOP = '(min-width: 1024px)'
