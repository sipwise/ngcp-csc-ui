
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
                    const hasSubscriberProfileAttribute = store.getters['user/hasSubscriberProfileAttribute'](to.meta.profileAttribute)
                    if (to.meta.license && hasSubscriberProfileAttribute) {
                        // Guard to assure that:
                        // CE users have access to all available menus as they do not have licenses
                        if (store.getters['user/isSpCe']) {
                            next()
                        }
                        // users cannot click on menu if it is mistakenly visible when the license is inactive
                        store.getters['user/isLicenseActive'](to.meta.license) ? next() : next('/')
                    }

                    hasSubscriberProfileAttribute ? next() : next('/')
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
    Dark.set(true)
}
