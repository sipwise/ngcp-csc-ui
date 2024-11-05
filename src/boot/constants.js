export default ({ app }) => {
    app.config.globalProperties.$faxQualityOptions = [
        {
            get label () {
                return app.i18n.global.tc('Normal')
            },
            value: 'normal'
        },
        {
            get label () {
                return app.i18n.global.tc('Fine')
            },
            value: 'fine'
        },
        {
            get label () {
                return app.i18n.global.tc('Super')
            },
            value: 'super'
        }
    ]
    app.config.globalProperties.$faxQualityOptionsDefault = app.config.globalProperties.$faxQualityOptions[0]
}
