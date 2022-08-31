
import {
    RequestState
} from '../common'
import { LIST_DEFAULT_ROWS } from 'src/api/common'

export default {
    page: 1,
    rows: LIST_DEFAULT_ROWS,
    conversations: [],
    downloadVoiceMailState: RequestState.button,
    downloadVoiceMailError: null,
    downloadFaxState: RequestState.button,
    downloadFaxError: null,
    reloadItemsState: RequestState.button,
    reloadItemsError: null,
    playVoiceMailUrls: {},
    playVoiceMailStates: {},
    playVoiceMailErrors: {},
    currentPage: 0,
    reachedLastPage: false,
    nextPageState: RequestState.initiated,
    nextPageError: null,
    items: [],
    itemsReloaded: false,
    blockedNumbersIncoming: new Set(),
    blockedModeIncoming: null,
    blockedIncomingState: RequestState.initiated,
    blockedIncomingError: null,
    blockedNumbersOutgoing: new Set(),
    blockedModeOutgoing: null,
    blockedOutgoingState: RequestState.initiated,
    blockedOutgoingError: null,
    toggleBlockedState: RequestState.initiated,
    toggleBlockedError: null,
    lastToggledType: null,
    deletionState: RequestState.initiated,
    deletionError: null
}
