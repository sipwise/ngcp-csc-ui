import localeEn from './en.json'
import localeFr from './fr.json'
import localeIt from './it.json'
import localeEs from './es.json'
import localeDe from './de.json'
import { i18n } from 'boot/i18n'
import { setSession } from 'src/storage'
import { Quasar } from 'quasar'

export default function messages () {
    return {
        'en-US': patchKeysForFallback(localeEn),
        de: patchKeysForFallback(localeDe),
        es: patchKeysForFallback(localeEs),
        fr: patchKeysForFallback(localeFr),
        it: patchKeysForFallback(localeIt)
    }
}

const loadedLanguages = ['en-US']
async function loadLanguageAsync (lang) {
    if (i18n.locale !== lang && !loadedLanguages.includes(lang)) {
        const language = lang === 'en-US' ? 'en' : lang
        await import(
            /* webpackChunkName: "lang-[request]" */
            `./${language}`
        ).then(
            messages => {
                i18n.global.setLocaleMessage(lang, patchKeysForFallback(messages.default))

                loadedLanguages.push(lang)
            }
        ).catch((e) => {
            console.error(e)
            i18n.global.setLocaleMessage(lang, {})
        })
    }
}

function patchKeysForFallback (messages = {}) {
    // Note: not translated keys may be defined as keys with empty string value. We should delete or replace such keys
    // with null or undefined value to allow VueI18n language fallback mechanism works properly
    Object.entries(messages).forEach(([key, value]) => {
        if (typeof value === 'string' && value.trim() === '') {
            messages[key] = undefined
        }
    })
    return messages
}

export async function setLanguage (locale) {
    const lang = normalizeLocaleCode(locale)
    setSession('locale', lang)
    await loadLanguageAsync(lang)
    i18n.locale = lang
    i18n.global.locale = lang

    import(
        /* webpackInclude: /(en-US|de|es|fr|it)\.js$/ */
        'quasar/lang/' + lang
    ).then(qLang => {
        Quasar.lang.set(qLang.default)
    })

    // Note: please extend "reloadLanguageRelatedData" action in the store if you are using language related API endpoints
}

/**
 * It converts language code from V2 (new CSC) to V1 UI (old Panel CSC) format
 * @param {string} lang
 * @returns {string}
 */
export function convertLangV2toV1 (lang) {
    return lang === 'en-US' ? 'en' : lang
}

/**
 * It converts language code from V1 (old Panel CSC) to V2 UI (new CSC) format
 * @param {string} lang
 * @returns {string}
 */
export function convertLangV1toV2 (lang) {
    return ['en', 'i-default'].includes(lang) ? 'en-US' : lang
}

export function getCurrentLangAsV1Format () {
    return convertLangV2toV1(i18n.locale)
}

export function normalizeLocaleCode (locale) {
    const shortLangCode = String(locale || 'en-US').substring(0, 2).toLowerCase()
    const langCodeInV2Format = (shortLangCode === 'en') ? 'en-US' : shortLangCode
    const langCode = Object.keys(messages()).filter(l => l === langCodeInV2Format)[0]
    return langCode || 'en-US'
}

export function getLangFromBrowserDefaults () {
    const browserLanguage = navigator?.language
    return normalizeLocaleCode(browserLanguage)
}
