import { store } from 'src/boot/store'
import appConfig from 'src/config/app'

// Export for direct import
export { appConfig }

export default async ({ app }) => {
    // Add to global properties for Options API
    app.config.globalProperties.$appConfig = appConfig

    // Provide for Composition API
    app.provide('appConfig', appConfig)

    // Keep store reference for backward compatibility
    store.$appConfig = appConfig
}
