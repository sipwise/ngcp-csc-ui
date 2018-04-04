'use strict';

import { ListState, AddState, RemoveState } from '../common'

export default {
    pilot: null,
    groups: {},
    groupsOrdered: [],
    seats: {},
    seatsOrdered: [],
    numbers: [],
    numbersMap : {},
    listAllState: ListState.initiated,
    listAllError: null,
    listLoadingSilently: false,
    addGroupState: AddState.button,
    addGroupError: null,
    addSeatState: AddState.button,
    addSeatError: null,
    removeSeatState: RemoveState.initiated,
    removeSeatError: null,
    removeSeatItem: null,
    listItemUpdating: null,
    listItemUpdateState: null,
    listItemUpdateError: null
}
