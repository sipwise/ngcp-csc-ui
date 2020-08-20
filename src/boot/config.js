
import Vue from 'vue'
import config from 'src/config'

Vue.use({
	install (Vue, options) {
		Vue.$config = config
	}
})

export default ({ app }) => {
	app.config = config
}
