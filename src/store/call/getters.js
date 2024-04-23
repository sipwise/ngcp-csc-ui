import {
    normalizeDestination
} from 'src/filters/number-format'
import {
    CallState,
    CallStateTitle
} from 'src/store/call/common'

export default {
    isCallEnabled (state) {
        return state.callEnabled
    },
    callNumberInput (state) {
        let inputNumber = ''
        if (state.numberInput.includes('@')) {
            inputNumber = state.numberInput.split('@')[0]
        } else {
            inputNumber = state.numberInput
        }
        return inputNumber
    },
    callState (state) {
        return state.callState
    },
    callNumberFormatted (state, getters) {
        return normalizeDestination(state.number)
    },
    callStateTitle (state) {
        return CallStateTitle[state.callState]
    },
    callStateSubtitle (state, getters) {
        if (state.callState === CallState.initiating ||
            state.callState === CallState.ringing ||
            state.callState === CallState.incoming ||
            state.callState === CallState.hold ||
            state.callState === CallState.established) {
            return getters.callNumberFormatted
        } else if (state.callState === CallState.ended) {
            return getters.callEndedReasonFormatted
        } else {
            return ''
        }
    },
    connectionError (state) {
        return state.connectionError
    }
}
