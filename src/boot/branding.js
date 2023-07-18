import { getCssVar } from 'quasar'

export default async ({ Vue, store, app }) => {
    await store.dispatch('user/setDefaultBranding', {
        primaryColor: getCssVar('primary'),
        secondaryColor: getCssVar('secondary')
    })
}
