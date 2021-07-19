
import Vue from 'vue'
import VueI18n from 'vue-i18n'
import {
    messages
} from 'src/i18n'
import {
    hasSession,
    getSession,
    setSession
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
    app.i18n = i18n
    store.$i18n = i18n
    if (!hasSession('locale')) {
        setSession('locale', navigator.language)
    }
    i18n.locale = getSession('locale') + ''

    store.watch(() => i18n.locale, () => {
        store.dispatch('reloadLanguageRelatedData')
    })
}
