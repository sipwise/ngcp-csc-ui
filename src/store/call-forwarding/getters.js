import _ from 'lodash'

export function groups (state) {
    const types = ['cfu', 'cft', 'cfna', 'cfb']
    const mappings = []
    types.forEach((type) => {
        state.mappings[type].forEach((mapping, index) => {
            const clonedMapping = _.clone(mapping)
            clonedMapping.type = type
            clonedMapping.index = index
            mappings.push(clonedMapping)
        })
    })
    return mappings
}

export function ringTimeout (state) {
    return state.mappings.cft_ringtimeout
}

export function announcements (state) {
    return state.announcements
}
