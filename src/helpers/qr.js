export function qrPayload ({ subscriber, server, token }) {
    return `username=${subscriber}&server=${server}&token=${token}`
}
