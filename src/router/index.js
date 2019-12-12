import Vue from 'vue'
import Router from 'vue-router'
import Login from '@/components/Login.vue'
import Home from '@/components/Home.vue'
import Welcome from '@/components/Welcome.vue'
import Users from '../components/user/Users.vue'
import Rights from '@/components/power/Rights.vue'

Vue.use(Router)

const router = new Router({
  routes: [
    {
      path: '/',
      redirect: '/login'
    },
    {
      path: '/login',
      component: Login
    },
    {
      path: '/home',
      component: Home,
      redirect: '/welcome',
      children: [
        { path: '/welcome', component: Welcome },
        { path: '/users', component: Users },
        {path: '/rights',component: Rights},
      ]
    },

  ]
})
// 如果用户没有登录，但直接访问URL到特定页面，需要重新弄导航到登录页

// 挂载路由导航守卫
router.beforeEach((to, from, next) => {
  // to 将要访问的路径
  // from 代表从哪个路径跳转而来
  // next  是一个函数，表示方行
  //    next()  方行  next('/login')    强制跳转
  if (to.path === '/login') {
    return next()
  }
  // 获取token
  const tokenStr = window.sessionStorage.getItem('token');
  if (!tokenStr) {
    return next('/login')
  } else {
    next()
  }
})

export default router

// 解决保存 NavigationDuplicated {_name: "NavigationDuplicated", name: "NavigationDuplicated", message: "Navigat
const originalPush = Router.prototype.push;
Router.prototype.push = function push(location) {
  return originalPush.call(this, location).catch(err => err);
};