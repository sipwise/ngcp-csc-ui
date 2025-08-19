import { Dark } from 'quasar'
import {
    getJwt, getSubscriberId,
    hasJwt
} from 'src/auth'
import { store } from 'src/boot/store'

export default ({ app, router }) => {
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
            default: {
                // 1. Admin check
                if (to.meta?.adminOnly && !store.getters['user/isAdmin']) {
                    return next('/')
                }

                // 2. Profile attribute check
                if (to.meta?.profileAttribute &&
                    !store.getters['user/hasSubscriberProfileAttribute'](to.meta.profileAttribute)) {
                    return next('/')
                }

                // 3. Profile attributes array check
                if (to.meta?.profileAttributes &&
                    !store.getters['user/hasSomeSubscriberProfileAttributes'](to.meta.profileAttributes)) {
                    return next('/')
                }

                // 4. License check
                if (to.meta?.license) {
                    const isSpCe = store.getters['user/isSpCe']

                    // CE-specific check
                    if (isSpCe && !to.meta.allowCE) {
                        return next('/')
                    }

                    // License check for non-CE users
                    if (!isSpCe && !store.getters['user/hasLicenses']([to.meta.licenses])) {
                        return next('/')
                    }
                }

                // 5. Platform Feature check
                if (to.meta?.platformFeature &&
                    !store.getters['user/hasPlatformFeature'](to.meta.platformFeature)) {
                    return next('/')
                }

                // 6. Capability check
                if (to.meta?.capability &&
                    !store.getters['user/hasCapability'](to.meta.capability)) {
                    return next('/')
                }

                // All checks passed, route is accessible
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
