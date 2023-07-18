
export default ({ Vue, app }) => {
    app.config.globalProperties.$errorMessage = (def) => {
        let message = null
        if (def.$errors && def.$errors.length) {
            if (def.$errors[0].$validator) {
                message = app.i18n.global.tc('validators.' + def.$errors[0].$validator)
            }
        }
        return message
    }
}
