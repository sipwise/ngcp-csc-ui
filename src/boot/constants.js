export default ({ Vue, app }) => {
    Vue.prototype.$faxQualityOptions = [
        {
            get label () { return app.i18n.t('Normal') },
            value: 'normal'
        },
        {
            get label () { return app.i18n.t('Fine') },
            value: 'fine'
        },
        {
            get label () { return app.i18n.t('Super') },
            value: 'super'
        }
    ]
    Vue.prototype.$faxQualityOptionsDefault = Vue.prototype.$faxQualityOptions[0]
}
