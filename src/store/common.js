'use strict'

export const RequestState = {
    button: 'button',
    initiated: 'initiated',
    requesting: 'requesting',
    succeeded: 'succeeded',
    failed: 'failed'
}

export const CreationState = {
    initiated: 'initiated',
    input: 'input',
    creating: 'creating',
    created: 'created',
    error: 'error'
}

export const ListState = {
    hidden: 'hidden',
    visible: 'visible'
}

/**
 * Replace an item by id within a list, or append it if not present.
 * Returns a new array; does not mutate the input list.
 */
export function upsertById (list, item) {
    const index = list.findIndex((existing) => existing.id === item.id)
    if (index === -1) {
        return [...list, item]
    }
    const updated = [...list]
    updated[index] = item
    return updated
}
