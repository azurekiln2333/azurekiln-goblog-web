import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    component: () => import('@/components/common/BlogLayout.vue'),
    children: [
      {
        path: '',
        name: 'Home',
        component: () => import('@/views/HomeView.vue')
      },
      {
        path: 'article/:id',
        name: 'ArticleDetail',
        component: () => import('@/views/ArticleDetailView.vue')
      },
      {
        path: 'search',
        name: 'Search',
        component: () => import('@/views/SearchView.vue')
      },
      {
        path: 'user/:id',
        name: 'UserProfile',
        component: () => import('@/views/UserProfileView.vue')
      }
    ]
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/LoginView.vue')
  },
  {
    path: '/register',
    name: 'Register',
    component: () => import('@/views/RegisterView.vue')
  },
  {
    path: '/user',
    component: () => import('@/components/common/BlogLayout.vue'),
    meta: { requiresAuth: true },
    children: [
      {
        path: 'center',
        name: 'UserCenter',
        component: () => import('@/views/UserCenterView.vue')
      },
      {
        path: 'messages',
        name: 'Messages',
        component: () => import('@/views/MessagesView.vue')
      },
      {
        path: 'editor',
        name: 'ArticleEditor',
        component: () => import('@/views/ArticleEditorView.vue')
      },
      {
        path: 'editor/:id',
        name: 'ArticleEditorEdit',
        component: () => import('@/views/ArticleEditorView.vue')
      }
    ]
  },
  {
    path: '/admin',
    component: () => import('@/components/common/AdminLayout.vue'),
    meta: { requiresAuth: true, requiresAdmin: true },
    children: [
      {
        path: '',
        name: 'AdminDashboard',
        component: () => import('@/views/admin/DashboardView.vue')
      },
      {
        path: 'articles',
        name: 'AdminArticles',
        component: () => import('@/views/admin/ArticlesView.vue')
      },
      {
        path: 'categories',
        name: 'AdminCategories',
        component: () => import('@/views/admin/CategoriesView.vue')
      },
      {
        path: 'users',
        name: 'AdminUsers',
        component: () => import('@/views/admin/UsersView.vue')
      },
      {
        path: 'images',
        name: 'AdminImages',
        component: () => import('@/views/admin/ImagesView.vue')
      },
      {
        path: 'banners',
        name: 'AdminBanners',
        component: () => import('@/views/admin/BannersView.vue')
      },
      {
        path: 'logs',
        name: 'AdminLogs',
        component: () => import('@/views/admin/LogsView.vue')
      },
      {
        path: 'settings',
        name: 'AdminSettings',
        component: () => import('@/views/admin/SettingsView.vue')
      },
      {
        path: 'friend-links',
        name: 'AdminFriendLinks',
        component: () => import('@/views/admin/FriendLinksView.vue')
      }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior() {
    return { top: 0 }
  }
})

router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('accessToken')
  if (to.meta.requiresAuth && !token) {
    next({ name: 'Login', query: { redirect: to.fullPath } })
  } else {
    next()
  }
})

export default router
