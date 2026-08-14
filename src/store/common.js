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
 * Standard request state object
 */
export function createRequestState () {
    return {
        state: RequestState.initiated,
        error: null,
        data: null
    }
}

/**
 * Helper to check request states
 */
export function isRequesting (state) {
    return state === RequestState.requesting
}

export function isSucceeded (state) {
    return state === RequestState.succeeded
}

export function isFailed (state) {
    return state === RequestState.failed
}

/**
 * Standard mutations for request lifecycle
 */
export function createRequestMutations (stateProp, dataProp = null) {
    return {
        [`${stateProp}Requesting`] (state) {
            state[`${stateProp}State`] = RequestState.requesting
            state[`${stateProp}Error`] = null
        },
        [`${stateProp}Succeeded`] (state, data) {
            state[`${stateProp}State`] = RequestState.succeeded
            state[`${stateProp}Error`] = null
            if (dataProp && data !== undefined) {
                state[dataProp] = data
            }
        },
        [`${stateProp}Failed`] (state, error) {
            state[`${stateProp}State`] = RequestState.failed
            state[`${stateProp}Error`] = error
        }
    }
}
