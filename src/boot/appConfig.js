import appConfig from '../config/app'

export default async ({ Vue, store, router, app }) => {
    Vue.prototype.$appConfig = appConfig
    app.$appConfig = appConfig
}
