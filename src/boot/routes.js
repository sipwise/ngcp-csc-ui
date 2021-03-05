
import routes from 'src/router/routes'
import _ from 'lodash'
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
                next()
            }
        }
    })

    router.afterEach((to, from) => {
        const mainTitle = app.i18n.t('CSC')
        let title = _.get(to, 'meta.title', '')
        const subTitle = _.get(to, 'meta.subtitle', '')
        if (mainTitle !== '') {
            title = mainTitle + ' - ' + title
        }
        if (subTitle !== '') {
            title = title + ' - ' + subTitle
        }
        document.title = title
        store.commit('routeChanged', to)
    })

    if (hasJwt()) {
        store.commit('user/loginSucceeded', {
            jwt: getJwt(),
            subscriberId: getSubscriberId()
        })
    }

    store.$router = router
    router.addRoutes(routes(app))
    Dark.set(true)
}
