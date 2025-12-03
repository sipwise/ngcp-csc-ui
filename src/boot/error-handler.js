import { setupErrorHandler } from 'src/helpers/errorHandler'

export default ({ app }) => {
    // This runs ONCE when app starts
    // Sets up global error catching for ALL components
    setupErrorHandler(app)
}
