export async function parseBlobToObject (blob) {
    const text = await blob.text()
    return JSON.parse(text)
}
