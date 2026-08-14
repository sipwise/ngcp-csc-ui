import { getLocal, setLocal } from 'src/storage'
import { v4 } from 'uuid'

const SIP_INSTANCE_ID_NAME = 'sip_instance_id'

export function setSipInstanceId (instanceId) {
    setLocal(SIP_INSTANCE_ID_NAME, instanceId)
}

export function getSipInstanceId () {
    let instanceId = getLocal(SIP_INSTANCE_ID_NAME)
    if (!instanceId) {
        instanceId = v4()
        setSipInstanceId(instanceId)
    }
    return instanceId
}

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
    }
    return 'phone'
}

export function callIconColor (call) {
    if (call.call_type === 'call' && (call.status === 'cancel' ||
        call.status === 'offline' || call.status === 'noanswer')) {
        return 'negative'
    } else if (call.call_type === 'call' && (call.direction === 'in' ||
        call.direction === 'out')) {
        return 'primary'
    }
    return 'white'
}
