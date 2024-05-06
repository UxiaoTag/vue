import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import ClientView from '@/views/ClientView.vue'
import ConfigChangeView from '@/views/ConfigChangeView.vue'
import NodeStatusView from '@/views/NodeStatusView.vue'
import LogsView from '@/views/LogsView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      redirect: '/home' // 使用redirect属性进行重定向
    },
    {
      path: '/home',
      name: 'home',
      component: HomeView
    },
    {
      path: '/client',
      name: 'client',
      component: ClientView
    },
    {
      path: '/configChange',
      name: 'configChange',
      component: ConfigChangeView
    },
    {
      path: '/nodeStatus',
      name: 'nodeStatus',
      component: NodeStatusView
    },
    {
      path: '/about',
      name: 'about',
      // route level code-splitting
      // this generates a separate chunk (About.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: () => import('../views/AboutView.vue')
    },{
      path:'/logs',
      name:'logs',
      component:LogsView
    }
  ]
})

export default router
