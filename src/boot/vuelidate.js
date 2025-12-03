import { errorMessages } from 'src/validators'

export const getErrorMessage = (v$) => {
    if (v$ && v$.length) {
        if (v$[0].$validator && errorMessages[v$[0].$validator]) {
            return errorMessages[v$[0].$validator](v$[0].$params, v$[0])
        }
    }
    return ''
}

// Composable for Composition API
export function useValidationErrors () {
    return {
        getErrorMessage
    }
}

export default ({ app }) => {
    // Add to global properties for Options API
    app.config.globalProperties.$errMsg = getErrorMessage

    // Provide for Composition API
    app.provide('validationErrors', { getErrorMessage })
}
