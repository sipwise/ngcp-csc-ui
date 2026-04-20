import { CreationState } from 'src/store/common'

export function groups (state) {
    const types = ['cfu', 'cft', 'cfna', 'cfb']
    const mappings = []
    types.forEach((type) => {
        const typeMapping = state.mappings?.[type]
        if (Array.isArray(typeMapping)) {
            typeMapping.forEach((mapping, index) => {
                const clonedMapping = { ...mapping }
                clonedMapping.type = type
                clonedMapping.index = index
                mappings.push(clonedMapping)
            })
        }
    })
    return mappings
}

export function announcements (state) {
    return state.announcements
}

export function bNumberSets (state) {
    return state.bNumberSetMap ? Object.values(state.bNumberSetMap) : []
}

export function ringTimeout (state) {
    return state.mappings.cft_ringtimeout
}

export function sourceSets (state) {
    return state.sourceSetMap ? Object.values(state.sourceSetMap) : []
}

export function seats (state) {
    return Object.keys(state.seatMapByPrimaryNumber) || []
}

export function seatByPrimaryNumber (state) {
    return (primaryNumber) => state.seatMapByPrimaryNumber?.[primaryNumber] || null
}

export function isCfAddFormDisabled (state) {
    return state.cfCreationState === CreationState.initiated ||
    state.cfCreationState === CreationState.created
}

export function isCfCreating (state) {
    return state.cfCreationState === CreationState.creating
}
