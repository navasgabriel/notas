<script setup>
import { ref, watch, onBeforeUnmount } from 'vue'

const props = defineProps({ open: Boolean, label: { type: String, default: 'Detalle' } })
const emit = defineEmits(['close'])

const sheet = ref(null)
const dragY = ref(0)
let startY = null

// arrastrar la agarradera hacia abajo para cerrar
function onDown(e) { startY = e.clientY; e.target.setPointerCapture?.(e.pointerId) }
function onMove(e) { if (startY !== null) dragY.value = Math.max(0, e.clientY - startY) }
function onUp() {
  if (startY === null) return
  if (dragY.value > 110) emit('close')
  dragY.value = 0
  startY = null
}

const onKey = e => e.key === 'Escape' && emit('close')
watch(() => props.open, open => {
  document.body.style.overflow = open ? 'hidden' : ''
  open ? addEventListener('keydown', onKey) : removeEventListener('keydown', onKey)
  if (open) requestAnimationFrame(() => sheet.value?.scrollTo(0, 0))
}, { immediate: true })
onBeforeUnmount(() => { document.body.style.overflow = ''; removeEventListener('keydown', onKey) })
</script>

<template>
  <Teleport to="body">
    <Transition name="sheet">
      <div v-if="open" class="overlay" @click.self="emit('close')">
        <div ref="sheet" class="sheet" role="dialog" aria-modal="true" :aria-label="label"
             :style="dragY ? { transform: `translateY(${dragY}px)`, transition: 'none' } : null">
          <div class="grab-zone" @pointerdown="onDown" @pointermove="onMove" @pointerup="onUp" @pointercancel="onUp">
            <div class="grab" />
          </div>
          <slot />
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.overlay {
  position: fixed; inset: 0; z-index: 50; background: rgba(74, 63, 85, .32);
  display: flex; align-items: flex-end; justify-content: center;
}
.sheet {
  width: 100%; max-width: 560px; height: calc(100dvh - 34px);
  background: var(--cream); border-radius: 30px 30px 0 0; overflow-y: auto; overscroll-behavior: contain;
  box-shadow: 0 -20px 40px -20px rgba(40, 25, 45, .4);
  transition: transform .3s cubic-bezier(.2, .8, .2, 1);
  padding-bottom: env(safe-area-inset-bottom);
}
.grab-zone { position: sticky; top: 0; z-index: 2; height: 22px; display: grid; place-items: center; cursor: grab; touch-action: none; background: linear-gradient(var(--cream) 60%, transparent); }
.grab { width: 44px; height: 5px; border-radius: 9px; background: #DCCFC4; }

.sheet-enter-active, .sheet-leave-active { transition: background .3s ease; }
.sheet-enter-from, .sheet-leave-to { background: transparent; }
.sheet-enter-active .sheet, .sheet-leave-active .sheet { transition: transform .32s cubic-bezier(.2, .8, .2, 1); }
.sheet-enter-from .sheet, .sheet-leave-to .sheet { transform: translateY(100%); }
</style>
