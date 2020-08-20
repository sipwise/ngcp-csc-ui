import _ from 'lodash'
import localeEn from './en.json'
import localeFr from './fr.json'
import localeIt from './it.json'
import localeEs from './es.json'
import localeDe from './de.json'

export const defaultLocale = 'en-US'

export const messages = {
	'en-US': localeEn,
	fr: localeFr,
	it: localeIt,
	es: localeEs,
	de: localeDe
}

export function getLanguageLabels () {
	const languageLabels = []
	Object.keys(messages).forEach((locale) => {
		languageLabels.push([locale, messages[locale].languageLabel])
	})
	return languageLabels
}

export function getLanguageLabel (locale) {
	if (_.has(messages, locale)) {
		return messages[locale].languageLabel
	} else {
		return messages[defaultLocale].languageLabel
	}
}
