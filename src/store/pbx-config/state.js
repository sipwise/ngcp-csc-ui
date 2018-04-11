'use strict';

import { RequestState } from '../common'

export default {
    pilot: null,
    groups: {},
    groupsOrdered: [],
    seats: {},
    seatsOrdered: [],
    numbers: [],
    numbersMap : {},
    listState: RequestState.initiated,
    listError: null,
    listLoadingSilently: false,
    addState: RequestState.initiated,
    addError: null,
    addItem: null,
    updateState: RequestState.initiated,
    updateError: null,
    updateItem: null,
    removeState: RequestState.initiated,
    removeError: null,
    removeItem: null
}
