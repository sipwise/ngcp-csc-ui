
export function callIcon (call) {
    if (call.call_type === 'cfu' || call.call_type === 'cfna' ||
        call.call_type === 'cfb' || call.call_type === 'cft') {
        return 'phone_forwarded'
    } else if (call.call_type === 'call' && call.direction === 'in' && call.status === 'cancel') {
        return 'call_missed'
    } else if (call.call_type === 'call' && call.direction === 'in') {
        return 'call_received'
    } else if (call.call_type === 'call' && call.direction === 'out') {
        return 'call_made'
    } else {
        return 'phone'
    }
}

export function callIconColor (call) {
    if (call.call_type === 'call' && (call.status === 'cancel' ||
        call.status === 'offline' || call.status === 'noanswer')) {
        return 'negative'
    } else if (call.call_type === 'call' && (call.direction === 'in' ||
        call.direction === 'out')) {
        return 'primary'
    } else {
        return 'white'
    }
}
