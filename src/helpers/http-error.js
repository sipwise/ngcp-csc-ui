function extractHtmlErrorTitle (data, status) {
    if (typeof data !== 'string') {
        return null
    }
    const match = data.match(/<title>\s*([^<]*?)\s*<\/title>/i)
    const title = match ? match[1].trim() : null
    return title && title.startsWith(String(status)) ? title : null
}

// Fall back to the standard phrase for common 5** statuses
// instead of Axios's generic "Request failed with status code X"
const STATUS_TEXT_FALLBACK = {
    500: 'Internal Server Error',
    502: 'Bad Gateway',
    503: 'Service Unavailable',
    504: 'Gateway Timeout'
}

export function getHttpErrorMessage (err, fallbackMessage) {
    const jsonMessage = getApiErrorMessage(err?.response?.data)
    if (typeof jsonMessage === 'string' && jsonMessage) {
        return jsonMessage
    }
    const status = err?.response?.status
    if (!status) {
        return fallbackMessage
    }
    const htmlTitle = extractHtmlErrorTitle(err.response.data, status)
    if (htmlTitle) {
        return htmlTitle
    }
    const statusText = err.response.statusText || err.message || STATUS_TEXT_FALLBACK[status]
    return statusText ? `${status} ${statusText}` : `${status}`
}

export function capitalizeFirstLetter (str) {
    if (!str) {
        return str
    }
    return str.charAt(0).toUpperCase() + str.slice(1)
}

function defaultEntryFormat (entry) {
    return capitalizeFirstLetter(entry.message)
}

export function getApiErrorSummary (data) {
    const entries = Array.isArray(data?.errors) ? data.errors : []
    if (!data?.message) {
        return null
    }
    const shown = data.message.match(/\s*\((\d+ of \d+ errors shown)\)$/)
    const message = shown ? data.message.slice(0, shown.index) : data.message
    if (entries.length > 0 && message.toLowerCase() === String(entries[0].message).toLowerCase()) {
        return shown ? shown[1] : null
    }
    return data.message
}

/**
 * Builds the text of an API v2 error body: the message followed by the single failures of errors[].
 * The message is left out when it repeats the first failure.
 */
export function getApiErrorMessage (data, formatEntry = defaultEntryFormat) {
    const entries = Array.isArray(data?.errors) ? data.errors : []
    if (entries.length === 0) {
        return data?.message
    }
    const details = entries.map(formatEntry).join('. ')
    const summary = getApiErrorSummary(data)
    return summary ? `${summary}: ${details}` : details
}
