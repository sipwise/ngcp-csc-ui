
import {
	Notify
} from 'quasar'

export class Alert {
	static create (options) {
		if (options.position === 'top-center') {
			options.position = 'top'
		} else if (options.position === 'top-center') {
			options.position = 'bottom'
		}
		options.timeout = 3000
		options.message = options.html
		delete options.html
		if (options.color === 'negative') {
			options.icon = 'error'
		}
		options.textColor = 'dark'
		Notify.create(options)
	}
}

export class Toast {
	static create (options) {
		options.textColor = 'dark'
		Notify.create(options)
	}
}
