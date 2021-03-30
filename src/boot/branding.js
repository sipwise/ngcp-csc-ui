import { colors } from 'quasar'

export default async ({ Vue, store, app }) => {
    await store.dispatch('user/setDefaultBranding', {
        primaryColor: colors.getBrand('primary'),
        secondaryColor: colors.getBrand('secondary')
    })
}
