import appConfig from 'src/config/app'

export default async ({ app, store }) => {
    app.config.globalProperties.$appConfig = appConfig
    store.$appConfig = appConfig
}
