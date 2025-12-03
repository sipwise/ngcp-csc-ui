import { showGlobalError } from 'src/helpers/ui'

/**
 * Wrapper for API calls in Vuex actions with standardized error handling
 * @param {Function} apiCall - The API function to call
 * @param {Object} context - Vuex action context
 * @param {Object} options - Configuration options
 */
export async function withApiCall (apiCall, context, options = {}) {
    const {
        requestingMutation = null,
        succeededMutation = null,
        failedMutation = null,
        showError = true,
        errorMessage = null,
        transform = (data) => data
    } = options

    try {
        if (requestingMutation) {
            context.commit(requestingMutation)
        }

        const result = await apiCall()
        const transformedData = transform(result)

        if (succeededMutation) {
            context.commit(succeededMutation, transformedData)
        }

        return transformedData
    } catch (err) {
        if (failedMutation) {
            context.commit(failedMutation, err.message || err)
        }

        if (showError) {
            const message = errorMessage || err.message || 'An error occurred'
            showGlobalError(message)
        }

        throw err
    }
}

/**
 * Create a standard loading wrapper for actions
 */
export function createLoadingAction (actionName, apiFunction, options = {}) {
    return async function (context, payload) {
        return withApiCall(
            () => apiFunction(payload),
            context,
            {
                requestingMutation: `${actionName}Requesting`,
                succeededMutation: `${actionName}Succeeded`,
                failedMutation: `${actionName}Failed`,
                ...options
            }
        )
    }
}
