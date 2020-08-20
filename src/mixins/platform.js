
import {
	Platform
} from 'quasar'

export default {

	computed: {
		isMobile () {
			return Platform.is.mobile
		},
		isDesktop () {
			return Platform.is.platform
		}
	}
}
