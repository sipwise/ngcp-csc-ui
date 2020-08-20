
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
		if (!hasJwt() && to.path !== '/login') {
			next({
				path: '/login'
			})
		} else if (hasJwt() && to.path === '/login') {
			next({
				path: '/'
			})
		} else if (hasJwt() && to.path === '/conference') {
			next({
				path: '/conference/room123'
			})
		} else {
			next()
		}
	})
	router.afterEach((to, from) => {
		const mainTitle = app.i18n.t('title')
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
