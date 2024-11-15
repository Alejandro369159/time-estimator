import { useUserStore } from '@/stores/useUserStore'
import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/login',
      name: 'login',
      component: () => import('@/pages/LoginPage.vue'),
    },
    {
      path: '/',
      name: 'navbar-layout',
      component: () => import('@/layout/NavbarLayout.vue'),
      redirect: '/mi-equipo',
      children: [
        {
          path: 'mi-equipo',
          name: 'my-team',
          component: () => import('@/pages/MyTeamPage.vue'),
        },
        {
          path: 'detalle-de-miembro/:id',
          name: 'member-detail',
          component: () => import('@/pages/MemberDetailPage.vue'),
        },
      ],
    },
  ],
})

router.beforeEach((to, from, next) => {
  const isAuthenticated = useUserStore().user
  if (!isAuthenticated && to.name !== 'login') {
    next({ name: 'login' })
  } else next()
})

export default router
