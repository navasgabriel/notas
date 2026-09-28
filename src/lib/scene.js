// Paisajes ilustrados para los datos de ejemplo (en lugar de fotos reales).
const PALETTES = {
  meadow: ['#BFE0F2', '#EAF6FB', '#FFF4C9', '#9ACD8E', '#6FB079', '#3E7F5B'],
  sunset: ['#F8B6A8', '#FFE2C6', '#FFF1D6', '#E48C9B', '#B96A8C', '#6D4F7C'],
  night: ['#2C2F5E', '#4B4A86', '#FFF3C4', '#5B5C95', '#3F4078', '#2A2B55'],
  dawn: ['#CFE3F7', '#FBE3EA', '#FFFFFF', '#A9C7E6', '#86A9D6', '#5E7FB5'],
  beach: ['#A7DCEB', '#E3F6F7', '#FFF6D6', '#7CC6D8', '#F3DDB3', '#E8C98F'],
  lav: ['#D9CFF1', '#F5EEFB', '#FFF7E3', '#B9A7E0', '#9B87CF', '#6F5FA9'],
  hills: ['#C4DDF0', '#EAF3FA', '#FFFFFF', '#2F5E8E', '#8CC76B', '#5E9F4A']
}

export const SCENES = Object.keys(PALETTES)

export function scene(name) {
  const [s1, s2, sun, h1, h2, h3] = PALETTES[name]
  const night = name === 'night'
  const stars = night
    ? Array.from({ length: 14 }, (_, i) => `<circle cx="${(i * 53) % 380 + 10}" cy="${(i * 37) % 150 + 10}" r="${i % 3 ? 1.4 : 2.2}" fill="#FFF3C4"/>`).join('')
    : ''
  const clouds = night ? '' : '<g fill="#fff" opacity=".85"><ellipse cx="90" cy="90" rx="44" ry="16"/><ellipse cx="118" cy="80" rx="30" ry="18"/><ellipse cx="300" cy="60" rx="36" ry="12"/><ellipse cx="322" cy="52" rx="22" ry="13"/></g>'
  const trees = name === 'hills' || name === 'meadow'
    ? '<g fill="#244A73"><ellipse cx="60" cy="300" rx="22" ry="44"/><ellipse cx="340" cy="310" rx="20" ry="40"/><ellipse cx="300" cy="250" rx="13" ry="28"/><ellipse cx="110" cy="250" rx="12" ry="26"/></g>'
    : ''
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400">
<defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${s1}"/><stop offset="1" stop-color="${s2}"/></linearGradient></defs>
<rect width="400" height="400" fill="url(#g)"/>${stars}
<circle cx="${night ? 300 : 280}" cy="${night ? 90 : 130}" r="${night ? 26 : 38}" fill="${sun}"/>${clouds}
<path d="M0 230 Q 90 170 190 215 T 400 200 V400 H0z" fill="${h1}"/>
<path d="M0 280 Q 120 220 230 270 T 400 260 V400 H0z" fill="${h2}"/>
<path d="M0 330 Q 140 290 260 330 T 400 320 V400 H0z" fill="${h3}"/>${trees}
</svg>`
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`
}
