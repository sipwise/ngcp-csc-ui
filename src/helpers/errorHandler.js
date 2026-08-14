import { showGlobalError } from 'src/helpers/ui'

export function setupErrorHandler (app) {
    app.config.errorHandler = (err, instance, info) => {
        // eslint-disable-next-line no-console
        console.error('Global error:', err)
        // eslint-disable-next-line no-console
        console.error('Component:', instance)
        // eslint-disable-next-line no-console
        console.error('Error info:', info)

        // Show user-friendly error
        if (err?.message) {
            showGlobalError(err.message)
        }
    }

    app.config.warnHandler = (msg, instance, trace) => {
        if (process.env.DEV) {
            // eslint-disable-next-line no-console
            console.warn('Vue warning:', msg)
            // eslint-disable-next-line no-console
            console.warn('Component:', instance)
            // eslint-disable-next-line no-console
            console.warn('Trace:', trace)
        }
    }
}
