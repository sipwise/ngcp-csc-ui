import { normalizePrimaryNumber, sortDestinationsByPriority } from 'src/helpers/call-forwarding-destinations'
import { CreationState } from 'src/store/common'

function getSeatPrimaryNumber (seat) {
    if (!seat?.primary_number) {
        return null
    }
    return normalizePrimaryNumber(seat.primary_number)
}

export function dataSucceeded (state, res) {
    if (res.bNumberSets) {
        const bNumberSetMap = {}
        res.bNumberSets.forEach((bNumberSet) => {
            bNumberSetMap[bNumberSet.id] = bNumberSet
        })
        state.bNumberSetMap = bNumberSetMap
    }
    if (res.destinationSets) {
        const destinationSetMap = {}
        const orderedDestinationSets = res.destinationSets.map((destinationSet) => {
            return {
                ...destinationSet,
                destinations: sortDestinationsByPriority(destinationSet.destinations)
            }
        })
        orderedDestinationSets.forEach((destinationSet) => {
            destinationSetMap[destinationSet.id] = destinationSet
        })
        state.destinationSetMap = destinationSetMap
    }
    if (res.sourceSets) {
        const sourceSetMap = {}
        res.sourceSets.forEach((sourceSet) => {
            sourceSetMap[sourceSet.id] = sourceSet
        })
        state.sourceSetMap = sourceSetMap
    }
    if (res.timeSets) {
        const timeSetMap = {}
        res.timeSets.forEach((timeSet) => {
            timeSetMap[timeSet.id] = timeSet
        })
        state.timeSetMap = timeSetMap
    }
    if (res.mappings) {
        state.mappings = res.mappings
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
