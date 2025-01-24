export default ({ app }) => {
    app.config.globalProperties.$faxQualityOptions = [
        {
            get label () {
                return app.i18n.global.t('Normal')
            },
            value: 'normal'
        },
        {
            get label () {
                return app.i18n.global.t('Fine')
            },
            value: 'fine'
        },
        {
            get label () {
                return app.i18n.global.t('Super')
            },
            value: 'super'
        }
    ]
    app.config.globalProperties.$faxQualityOptionsDefault = app.config.globalProperties.$faxQualityOptions[0]
}
