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
    const jsonMessage = err?.response?.data?.message
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
