import { getCssVar } from 'quasar'
import { store } from 'src/boot/store'

export default async ({ Vue, app }) => {
    await store.dispatch('user/setDefaultBranding', {
        primaryColor: getCssVar('primary'),
        secondaryColor: getCssVar('secondary')
    })
}
