import { errorMessages } from 'src/validators'
export default ({ app }) => {
    app.config.globalProperties.$errMsg = (v$) => {
        if (v$ && v$.length) {
            if (v$[0].$validator && errorMessages[v$[0].$validator]) {
                return errorMessages[v$[0].$validator](v$[0].$params, v$[0])
            }
        }
        return ''
    }
}
