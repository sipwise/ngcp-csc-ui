export function qrPayload ({ subscriber, server, expire, token }) {
    return `username=${subscriber}&server=${server}&expire=${expire}&token=${token}`
}
