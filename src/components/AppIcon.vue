<script setup>
defineProps({ name: { type: String, required: true }, size: { type: Number, default: 22 } })

const PATHS = {
  left: '<path d="M15 5l-7 7 7 7"/>',
  right: '<path d="M9 5l7 7-7 7"/>',
  x: '<path d="M6 6l12 12M18 6L6 18"/>',
  search: '<circle cx="11" cy="11" r="6.5"/><path d="M20 20l-4.2-4.2"/>',
  cal: '<rect x="3.5" y="5" width="17" height="15.5" rx="3"/><path d="M3.5 10h17M8 3v4M16 3v4"/>',
  heart: '<path d="M12 20s-7.5-4.6-7.5-10.2A4.2 4.2 0 0 1 12 7.3a4.2 4.2 0 0 1 7.5 2.5C19.5 15.4 12 20 12 20z"/>',
  heartfill: '<path fill="currentColor" d="M12 20s-7.5-4.6-7.5-10.2A4.2 4.2 0 0 1 12 7.3a4.2 4.2 0 0 1 7.5 2.5C19.5 15.4 12 20 12 20z"/>',
  camera: '<path d="M4 8.5h3l1.6-2.5h6.8L17 8.5h3v10H4z"/><circle cx="12" cy="13" r="3.4"/>',
  image: '<rect x="3.5" y="4.5" width="17" height="15" rx="3"/><circle cx="9" cy="10" r="1.8"/><path d="M20 16l-5-5-8 8.5"/>',
  shuffle: '<path d="M4 7h3.5c4 0 5 10 9 10H20M4 17h3.5c1.6 0 2.7-1.6 3.6-3.4M13.4 10.4C14.3 8.6 15.4 7 17 7h3M17.5 4.5L20 7l-2.5 2.5M17.5 14.5L20 17l-2.5 2.5"/>',
  mic: '<rect x="9" y="3.5" width="6" height="11" rx="3"/><path d="M5.5 11.5a6.5 6.5 0 0 0 13 0M12 18v3"/>',
  edit: '<path d="M4 20h4L19 9l-4-4L4 16z"/><path d="M13.5 6.5l4 4"/>',
  trash: '<path d="M4.5 7h15M9.5 7V4.5h5V7M6.5 7l1 13h9l1-13"/>',
  bell: '<path d="M6 16.5V11a6 6 0 0 1 12 0v5.5l1.5 1.5h-15z"/><path d="M10 20.5a2 2 0 0 0 4 0"/>',
  users: '<circle cx="9" cy="8.5" r="3.5"/><path d="M3 20c.5-3.6 3-5.5 6-5.5s5.5 1.9 6 5.5"/><circle cx="17" cy="9.5" r="2.6"/><path d="M16.5 14.6c2.4.2 4 1.8 4.5 4.4"/>',
  photos: '<rect x="3" y="7" width="13" height="13" rx="2.5"/><path d="M7.5 4h11a2.5 2.5 0 0 1 2.5 2.5v11"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  share: '<circle cx="6" cy="12" r="2.5"/><circle cx="18" cy="6" r="2.5"/><circle cx="18" cy="18" r="2.5"/><path d="M8.2 10.9l7.6-3.8M8.2 13.1l7.6 3.8"/>',
  logout: '<path d="M14 4.5h4a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2h-4M10 16l-4-4 4-4M6 12h10"/>',
  swap: '<path d="M7 4L4 7l3 3M4 7h13M17 20l3-3-3-3M20 17H7"/>'
}
</script>

<template>
  <svg class="app-icon" :width="size" :height="size" viewBox="0 0 24 24" aria-hidden="true" v-html="PATHS[name]" />
</template>

<style scoped>
.app-icon { fill: none; stroke: currentColor; stroke-width: 2; stroke-linecap: round; stroke-linejoin: round; display: block; flex: none; }
</style>
