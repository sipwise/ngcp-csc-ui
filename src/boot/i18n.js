import { store } from 'src/boot/store'
import messages, {
    getLangFromBrowserDefaults,
    setLanguage
} from 'src/i18n'
import { getSession } from 'src/storage'
import { createI18n } from 'vue-i18n'

export const defaultLocale = 'en-US'

const messageLoaded = messages()

const currentLocale = getSession('locale') || getLangFromBrowserDefaults() || defaultLocale

export const i18n = createI18n({
    locale: defaultLocale,
    fallbackLocale: defaultLocale,
    formatFallbackMessages: true,
    messages: messageLoaded
})

export default async ({ app }) => {
    app.use(i18n)
    app.i18n = i18n
    await setLanguage(currentLocale)
    store.watch(() => i18n.locale, () => {
        store.dispatch('reloadLanguageRelatedData')
    })
}
