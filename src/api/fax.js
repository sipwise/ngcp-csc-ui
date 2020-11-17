
import _ from 'lodash'
import {
	get,
	patchReplaceFull
} from './common'
import { i18n } from 'src/boot/i18n'

export async function getFaxServerSettings (subscriberId) {
	const result = await get({
		path: `api/faxserversettings/${subscriberId}`
	})
	const settings = _.clone(result)
	delete settings._links
	return settings
}

export async function setFaxServerField (options) {
	if (!['name', 'active', 'ecm', 't38', 'destinations'].includes(options.field)) {
		throw Error(`setFaxServerField: unknown field name ${options.field}`)
	}
	if (options.field === 'destinations') {
		// searching for duplicates
		const destinationsIds = options.value.map(d => d.destination)
		if ((new Set(destinationsIds)).size !== destinationsIds.length) {
			throw Error(i18n.t('faxSettings.destinationEmailExists'))
		}
	}
	return patchReplaceFull({
		path: `api/faxserversettings/${options.subscriberId}`,
		fieldPath: options.field,
		value: options.value
	})
}
