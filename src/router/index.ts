import { createRouter, createWebHistory, createWebHashHistory, RouteRecordRaw } from 'vue-router'
// import Home from '@/views/Home.vue'

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    name: 'Home',
    component: () => import(/* webpackChunkName: "art" */ '@/views/Home.vue'),
  },
  {
    path: '/menu',
    name: 'Menu',
    component: () => import(/* webpackChunkName: "art" */ '@/views/Menu.vue'),
  },
  {
    path: '/quick-fit',
    name: 'QuickFit',
    component: () => import(/* webpackChunkName: "art" */ '@/views/QuickFit.vue'),
  },
  {
    path: '/pro-fit',
    name: 'ProFit',
    component: () => import(/* webpackChunkName: "art" */ '@/views/ProFit.vue'),
  },
  {
    path: '/intel-fit',
    name: 'IntelFit',
    component: () => import(/* webpackChunkName: "art" */ '@/views/IntelFit.vue'),
  },
  {
    path: '/power-test',
    name: 'PowerTest',
    component: () => import(/* webpackChunkName: "art" */ '@/views/PowerTest.vue'),
  },
]

const router = createRouter({
  history: createWebHashHistory(),
  routes,
})

function isPC () {
  if (window.navigator.userAgent.match(/(phone|pad|pod|iPhone|iPod|ios|iPad|Android|Mobile|BlackBerry|IEMobile|MQQBrowser|JUC|Fennec|wOSBrowser|BrowserNG|WebOS|Symbian|Windows Phone)/i)) {
    return false // 移动端
  } else {
    return true // PC端
  }
}

// router.beforeEach(async (to, from) => {
//   if (isPC()) {
//     return true
//   } else {
//     if (to.name !== 'Mobile') {
//       return { name: 'Mobile' }
//     }
//   }
// })
// router.beforeEach(async (to, from) => {
//   if (localStorage.getItem('pwd') === btoa('cu' + foo())) {
//     return true
//   } else {
//     if (to.name !== 'NoPermit') {
//       return { name: 'NoPermit' }
//     }
//   }
// })

export default router
