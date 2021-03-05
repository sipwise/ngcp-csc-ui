
export default ({ Vue, app }) => {
    Vue.prototype.$faxQualityOptions = [
        { label: app.i18n.t('Normal'), value: 'normal' },
        { label: app.i18n.t('Fine'), value: 'fine' },
        { label: app.i18n.t('Super'), value: 'super' }
    ]
    Vue.prototype.$faxQualityOptionsDefault = Vue.prototype.$faxQualityOptions[0]
}
