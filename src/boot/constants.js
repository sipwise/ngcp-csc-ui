
export default ({ Vue, app }) => {
	Vue.prototype.$faxQualityOptions = [
		{ label: app.i18n.t('communication.quality.normal'), value: 'normal' },
		{ label: app.i18n.t('communication.quality.fine'), value: 'fine' },
		{ label: app.i18n.t('communication.quality.super'), value: 'super' }
	]
	Vue.prototype.$faxQualityOptionsDefault = Vue.prototype.$faxQualityOptions[0]
}
