
import _ from 'lodash'

export function getJsonBody (body) {
	if (_.isString(body)) {
		try {
			return JSON.parse(body)
		} catch (err) {
			return body
		}
	}
	return body
}
