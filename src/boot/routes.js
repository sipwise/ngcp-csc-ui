
import {
    Dark
} from 'quasar'
import {
    getJwt, getSubscriberId,
    hasJwt
} from 'src/auth'

export default ({ app, router, store }) => {
    router.beforeEach((to, from, next) => {
        const publicUrls = ['/login', '/recoverpassword']
        // not authorized user
        if (!hasJwt()) {
            if (!publicUrls.includes(to.path)) {
                next({
                    path: '/login'
                })
            } else {
                next()
            }
        } else {
            // already authorized user
            switch (to.path) {
            case '/login':
                next({
                    path: '/'
                })
                break
            case '/conference':
                next({
                    path: '/conference/room123'
                })
                break
            default:
                if (to.meta?.profileAttribute) {
                    store.getters['user/hasSubscriberProfileAttribute'](to.meta.profileAttribute) ? next() : next('/')
                } else if (to.meta?.profileAttributes) {
                    store.getters['user/hasSubscriberProfileAttributes'](to.meta.profileAttributes) ? next() : next('/')
                } else {
                    next()
                }
            }
        }
    })

    router.afterEach((to, from) => {
        store.commit('routeChanged', to)
    })

    if (hasJwt()) {
        store.commit('user/loginSucceeded', {
            jwt: getJwt(),
            subscriberId: getSubscriberId()
        })
    }

    store.$router = router
    Dark.set(true)
}
