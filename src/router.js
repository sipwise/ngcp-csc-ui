
import Vue from 'vue'
import VueRouter from 'vue-router'
import { store } from './store'
import routes from './routes'

Vue.use(VueRouter);

var router = new VueRouter({
    routes: routes
});

router.beforeEach((to, from, next) => {
    if (!store.getters['user/isLogged'] && to.path !== '/login') {
        next({
            path: '/login'
        });
    }
    else if (store.getters['user/isLogged'] && to.path === '/login') {
        next({
            path: '/'
        });
    }
    else {
        next();
    }
});

export default router;
