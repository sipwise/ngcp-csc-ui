
import Vue from 'vue'
import VueRouter from 'vue-router'
import { store } from './store'
import routes from './routes'

Vue.use(VueRouter);

var router = new VueRouter({
    /*
     * NOTE! VueRouter "history" mode DOESN'T works for Cordova builds,
     * it is only to be used only for websites.
     *
     * If you decide to go with "history" mode, please also open /config/index.js
     * and set "build.publicPath" to something other than an empty string.
     * Example: '/' instead of current ''
     *
     * If switching back to default "hash" mode, don't forget to set the
     * build publicPath back to '' so Cordova builds work again.
     */
    routes: routes
});

router.beforeEach((to, from, next) => {
    if (!store.getters['user/isLogged'] && to.path !== '/login') {
        next({
            path: '/login'
        });
    } else if (store.getters['user/isLogged'] && to.path === '/login') {
        next({
            path: '/'
        });
    } else {
        next();
    }
});

export default router;
