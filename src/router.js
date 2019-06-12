
import _ from 'lodash'
import Vue from 'vue'
import VueRouter from 'vue-router'
import { store } from './store'
import routes from './routes'
import { i18n } from './i18n'

Vue.use(VueRouter);

export const router = new VueRouter({
    routes: routes
});

router.beforeEach((to, from, next) => {
    let mainTitle = i18n.t('title');
    let title = _.get(to, 'meta.title', '');
    let subTitle = _.get(to, 'meta.subtitle', '');
    if(mainTitle !== '') {
        title = mainTitle + ' - ' + title;
    }
    if(subTitle !== '') {
        title = title + " - " + subTitle;
    }
    document.title = title;
    next();
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
