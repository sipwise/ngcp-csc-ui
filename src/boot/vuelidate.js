import Vuelidate from 'vuelidate'
import _ from 'lodash'

export default ({ Vue, app }) => {
	Vue.use(Vuelidate)
	Vue.prototype.$errorMessage = (def) => {
		let message = null
		_.forEach(def.$params, (param, paramName) => {
			if (def[paramName] === false) {
				message = app.i18n.t('validators.' + paramName)
			}
		})
		return message
	}
}
