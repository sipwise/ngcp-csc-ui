import { store } from 'src/boot/store'
import appConfig from 'src/config/app'

export default async ({ app }) => {
    app.config.globalProperties.$appConfig = appConfig
    store.$appConfig = appConfig
}
