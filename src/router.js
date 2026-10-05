import { createRouter, createWebHistory } from 'vue-router'
import { state } from './store/diary'

export const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/login', name: 'login', component: () => import('./views/LoginView.vue'), meta: { public: true } },
    { path: '/', name: 'home', component: () => import('./views/HomeView.vue') },
    { path: '/recuerdos', name: 'memories', component: () => import('./views/MemoriesView.vue') },
    { path: '/favoritos', name: 'favorites', component: () => import('./views/FavoritesView.vue') },
    { path: '/nosotros', name: 'couple', component: () => import('./views/CoupleView.vue') },
    { path: '/:pathMatch(.*)*', redirect: '/' }
  ]
})

router.beforeEach(to => {
  if (!to.meta.public && !state.session) return { name: 'login' }
  if (to.name === 'login' && state.session) return { name: 'home' }
})
