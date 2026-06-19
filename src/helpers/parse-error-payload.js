export async function parseErrorPayload (data) {
    if (typeof data?.text === 'function') {
        return JSON.parse(await data.text())
    }
    if (typeof data === 'string') {
        return JSON.parse(data)
    }
    return data
}

// Best-effort Blob -> string/JSON resolution, for messages formatted via getHttpErrorMessage
// (which expects a string or parsed object, not a Blob) rather than a specific error shape
export async function resolveBlobPayload (data) {
    if (typeof data?.text !== 'function') {
        return data
    }
    const text = await data.text()
    try {
        return JSON.parse(text)
    } catch (err) {
        return text
    }
}
