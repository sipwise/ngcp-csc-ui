
import Vue from 'vue'
import VueI18n from 'vue-i18n'
import {
    messages,
    getLangFromBrowserDefaults,
    setLanguage
} from 'src/i18n'
import {
    getSession
} from 'src/storage'

Vue.use(VueI18n)

export const defaultLocale = 'en-US'

export const i18n = new VueI18n({
    locale: defaultLocale,
    fallbackLocale: defaultLocale,
    formatFallbackMessages: true,
    messages
})

export default ({ app, store }) => {
    const currentLocale = getSession('locale') || getLangFromBrowserDefaults() || defaultLocale
    app.i18n = i18n
    store.$i18n = i18n
    setLanguage(currentLocale)
    store.watch(() => i18n.locale, () => {
        store.dispatch('reloadLanguageRelatedData')
    })
}
