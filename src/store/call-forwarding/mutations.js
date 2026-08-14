import { normalizePrimaryNumber } from 'src/helpers/call-forwarding-destinations'
import { CreationState } from 'src/store/common'

function getSeatPrimaryNumber (seat) {
    if (!seat?.primary_number) {
        return null
    }
    return normalizePrimaryNumber(seat.primary_number)
}

export function dataSucceeded (state, payload) {
    if (payload.bNumberSetMap) {
        state.bNumberSetMap = payload.bNumberSetMap
    }

    if (payload.destinationSetMap) {
        state.destinationSetMap = payload.destinationSetMap
    }

    if (payload.sourceSetMap) {
        state.sourceSetMap = payload.sourceSetMap
    }

    if (payload.timeSetMap) {
        state.timeSetMap = payload.timeSetMap
    }

    if (payload.mappings) {
        state.mappings = payload.mappings
    }
}

export function popupShow (state, popupId) {
    state.popupCurrent = popupId
}

export function setAnnouncements (state, announcements) {
    state.announcements = announcements
}

export function seatsSucceeded (state, seats) {
    const seatMapByPrimaryNumber = { ...state.seatMapByPrimaryNumber }

    seats.forEach((seat) => {
        const primaryNumber = getSeatPrimaryNumber(seat)
        if (primaryNumber) {
            seatMapByPrimaryNumber[primaryNumber] = seat
        }
    })

    state.seatMapByPrimaryNumber = seatMapByPrimaryNumber
}

export function resetState (state) {
    state.mappings = {
        cfu: [],
        cft: [],
        cfna: [],
        cfb: [],
        cft_ringtimeout: null
    }
    state.bNumberSetMap = {}
    state.destinationSetMap = {}
    state.sourceSetMap = {}
    state.timeSetMap = {}
    state.seatMapByPrimaryNumber = {}
    state.announcements = []
}

export function cfCreationRequesting (state, cf) {
    state.cfCreationState = CreationState.creating
    state.cfCreating = cf
}

export function cfCreationSucceeded (state) {
    state.cfCreationState = CreationState.created
}

export function enableCfAddForm (state) {
    state.cfCreationState = CreationState.input
    state.cfCreating = null
}

export function disableCfAddForm (state) {
    state.cfCreationState = CreationState.initiated
}
