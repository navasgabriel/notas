<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { login } from '@/store/diary'
import { scene } from '@/lib/scene'

const router = useRouter()
const email = ref('')
const password = ref('')
const who = ref('ella')
const error = ref('')

function submit() {
  if (!/^\S+@\S+\.\S+$/.test(email.value)) return (error.value = 'Revisa tu correo')
  if (password.value.length < 4) return (error.value = 'La contraseña debe tener al menos 4 caracteres')
  // Prototipo sin backend: cualquier correo y contraseña válidos entran.
  login(email.value.trim(), who.value)
  router.replace('/')
}

const floaters = [
  { s: 'sunset', t: 'Atardecer', r: -7, x: '8%', y: '12%' },
  { s: 'meadow', t: 'Tarde de helado', r: 5, x: '58%', y: '6%' },
  { s: 'night', t: 'Noche de estrellas', r: 4, x: '14%', y: '62%' },
  { s: 'lav', t: 'Domingo lento', r: -5, x: '60%', y: '66%' }
]
</script>

<template>
  <div class="login-page">
    <!-- escritorio: collage de recuerdos -->
    <section class="showcase" aria-hidden="true">
      <div v-for="f in floaters" :key="f.s" class="float" :style="{ left: f.x, top: f.y, '--r': f.r + 'deg' }">
        <img :src="scene(f.s)" alt="" /><span>{{ f.t }}</span>
      </div>
      <div class="show-text">
        <h2>Dos miradas,<br />un mismo día.</h2>
        <p>Cada noche escriben su nota y la guardan en el calendario de los dos.</p>
      </div>
    </section>

    <main class="form-side">
      <form class="login" novalidate @submit.prevent="submit">
        <svg class="couple-art" viewBox="0 0 220 150" aria-hidden="true">
          <ellipse cx="110" cy="140" rx="84" ry="8" fill="#F3DCD2" />
          <g class="bob-a">
            <rect x="52" y="64" width="50" height="66" rx="25" fill="#F2A7B9" />
            <circle cx="77" cy="60" r="26" fill="#FFE4D6" />
            <path d="M51 58c0-20 14-30 27-30s26 9 26 26c-8-8-20-12-34-10-7 1-13 7-19 14z" fill="#7A5A6E" />
            <circle cx="68" cy="63" r="3" fill="#4A3F55" /><circle cx="86" cy="63" r="3" fill="#4A3F55" />
            <ellipse cx="62" cy="71" rx="5" ry="3" fill="#F7A1B4" opacity=".75" /><ellipse cx="92" cy="71" rx="5" ry="3" fill="#F7A1B4" opacity=".75" />
            <path d="M73 72q4 4 8 0" stroke="#4A3F55" stroke-width="2.4" fill="none" stroke-linecap="round" />
          </g>
          <g class="bob-b">
            <rect x="118" y="60" width="52" height="70" rx="26" fill="#94C3E6" />
            <circle cx="144" cy="56" r="27" fill="#FFE4D6" />
            <path d="M117 52c2-17 14-25 28-25 15 0 26 9 26 22-12-6-30-8-54 3z" fill="#5B4636" />
            <circle cx="135" cy="59" r="3" fill="#4A3F55" /><circle cx="153" cy="59" r="3" fill="#4A3F55" />
            <ellipse cx="129" cy="67" rx="5" ry="3" fill="#F7A1B4" opacity=".75" /><ellipse cx="159" cy="67" rx="5" ry="3" fill="#F7A1B4" opacity=".75" />
            <path d="M140 68q4 4 8 0" stroke="#4A3F55" stroke-width="2.4" fill="none" stroke-linecap="round" />
          </g>
          <path class="heart" d="M110 34c-4-8-16-6-16 3 0 8 16 16 16 16s16-8 16-16c0-9-12-11-16-3z" fill="#E07E98" />
        </svg>

        <h1 class="brand">Nuestros <span>Días</span></h1>
        <p class="tagline">un diario para dos, un día a la vez</p>

        <label class="field"><span>Correo</span>
          <input v-model="email" type="email" placeholder="tucorreo@ejemplo.com" autocomplete="email" @input="error = ''" />
        </label>
        <label class="field"><span>Contraseña</span>
          <input v-model="password" type="password" placeholder="••••••••" autocomplete="current-password" @input="error = ''" />
        </label>

        <div class="who-pick" role="radiogroup" aria-label="¿Quién eres?">
          <label class="who ella"><input v-model="who" type="radio" value="ella" /><span><i class="dot ella" />Soy ella</span></label>
          <label class="who el"><input v-model="who" type="radio" value="el" /><span><i class="dot el" />Soy él</span></label>
        </div>

        <p v-if="error" class="error" role="alert">{{ error }}</p>
        <button class="btn primary block" type="submit">Entrar a nuestro diario</button>
        <p class="small">Prototipo: cualquier correo y contraseña entran.</p>
      </form>
    </main>
  </div>
</template>

<style scoped>
.login-page { min-height: 100dvh; display: grid; }
.showcase { display: none; }
.form-side { display: flex; justify-content: center; background: radial-gradient(120% 60% at 50% 0%, #FFE3EA 0%, var(--cream) 60%); }
.login { width: 100%; max-width: 420px; display: flex; flex-direction: column; align-items: center; padding: 48px 24px 32px; }
.couple-art { width: 230px; height: 160px; }
.bob-a { animation: bob 3.2s ease-in-out infinite; }
.bob-b { animation: bob 3.2s ease-in-out infinite .5s; }
.heart { transform-origin: 110px 40px; animation: float 2.4s ease-in-out infinite; }
@keyframes bob { 50% { transform: translateY(-3px); } }
@keyframes float { 50% { transform: translateY(-6px) scale(1.08); } }
.brand { font: 700 44px/1 var(--f-display); margin: 10px 0 6px; letter-spacing: -.5px; }
.brand span { color: var(--ella-deep); }
.tagline { font: 700 26px var(--f-script); color: var(--ink-2); margin: 0 0 26px; }
.who-pick { display: flex; gap: 10px; width: 100%; margin: 4px 0 18px; }
.who { flex: 1; position: relative; }
.who input { position: absolute; opacity: 0; inset: 0; }
.who span { display: flex; align-items: center; justify-content: center; gap: 8px; height: 50px; border-radius: 16px; border: 2px solid var(--line); background: #fff; font: 600 17px var(--f-display); color: var(--ink-2); cursor: pointer; transition: all .15s; }
.who input:focus-visible + span { outline: 3px solid var(--ella); outline-offset: 2px; }
.who.ella input:checked + span { border-color: var(--ella); background: var(--ella-soft); color: var(--ella-deep); }
.who.el input:checked + span { border-color: var(--el); background: var(--el-soft); color: var(--el-deep); }
.error { width: 100%; margin: 0 0 12px; padding: 10px 14px; border-radius: 12px; background: var(--ella-soft); color: var(--ella-deep); font-weight: 700; font-size: 14px; }
.small { margin-top: 16px; font-size: 13px; color: var(--muted); text-align: center; }

@media (min-width: 1024px) {
  .login-page { grid-template-columns: 1.1fr 1fr; }
  .form-side { align-items: center; background: var(--cream); }
  .showcase { display: block; position: relative; overflow: hidden; background: radial-gradient(90% 70% at 30% 20%, #FFE3EA, #FBEFE6 55%, #E7F0F9); }
  .float { position: absolute; width: 190px; background: #fff; padding: 10px 10px 14px; border-radius: 6px; transform: rotate(var(--r)); box-shadow: 0 24px 40px -24px rgba(74, 63, 85, .6); animation: drift 7s ease-in-out infinite; }
  .float:nth-child(2) { animation-delay: -2s; } .float:nth-child(3) { animation-delay: -4s; } .float:nth-child(4) { animation-delay: -1s; }
  .float img { display: block; width: 100%; height: 170px; object-fit: cover; border-radius: 3px; }
  .float span { display: block; margin-top: 8px; font: 700 24px var(--f-script); color: var(--ink); }
  @keyframes drift { 50% { transform: rotate(var(--r)) translateY(-10px); } }
  .show-text { position: absolute; left: 50%; top: 50%; transform: translate(-50%, -50%); text-align: center; width: 70%; }
  .show-text h2 { font: 700 54px/1.05 var(--f-display); margin: 0 0 14px; color: var(--ink); }
  .show-text p { font: 24px/1.35 var(--f-hand); color: var(--ink-2); margin: 0; }
}
</style>
