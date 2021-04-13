import Vue from 'vue'
import VueRouter, {RouteConfig} from 'vue-router'
import Home from '../views/Home.vue'
import Profile from '../components/Profile.vue'
import Posts from '../components/Posts.vue'
import User from '../components/User.vue'
import MainHeader from '../components/MainHeader.vue'

Vue.use(VueRouter)

const routes: Array<RouteConfig> = [
    {
        path: '/',
        name: 'Home',
        components: {
            default: Home,
            mainHeader: MainHeader  // 命名视图，和Home组件同等级渲染
        },
        /**
         *{
            * path: '/user/:id',
            * components: { default: User, sidebar: Sidebar },
            * props: { default: true, sidebar: false }
         *}
         * 路由组件传参。对于包含命名视图的路由，你必须分别为每个命名视图添加 `props` 选项
         */
        props: {
            default: true,
            mainHeader: false
        }
    },
    {
        path: '/about',
        name: 'About',
        // route level code-splitting
        // this generates a separate chunk (about.[hash].js) for this route
        // which is lazy-loaded when the route is visited.
        component: () => import(/* webpackChunkName: "about" */ '../views/About.vue'),
    },
    {
        path: '/user/:id',
        component: User,
        children: [
            { path: 'profile', component: Profile },
            { path: 'posts', component: Posts }
        ],
        props: true // 路由组件传参。在组件中可以获取到 id 属性，但是需要在组件中声明Prop id
    }
]

const router = new VueRouter({
    mode: 'history',
    base: process.env.BASE_URL,
    routes,
})

export default router
