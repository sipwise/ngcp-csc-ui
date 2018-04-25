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
    devicesOrdered: [],
    devices: {},
    profilesOrdered: [],
    profiles: {},
    modelsOrdered: [],
    models: {},
    listState: RequestState.initiated,
    listError: null,
    listLoadingSilently: false,
    listCurrentPage: 1,
    listLastPage: null,
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
