import Vue from "vue";
import {
    RequestState
} from '../common'

function linkCallsWithSameId(state) {
    let callId = null;
    let callIndex = null;
    state.items.forEach((item, index)=>{
        if(item.type === 'call' && item.call_type === 'call') {
            callId = item.call_id;
            callIndex = index;
        }
        else if (item.type === 'call' && item.call_id === callId) {
            let temp = state.items[callIndex];
            item.relatedCall = temp;
            state.items[callIndex] = item;
            state.items[index] = temp;
            callIndex = index;
        }
    });
}

export default {
    downloadVoiceMailRequesting(state) {
        state.downloadVoiceMailState = RequestState.requesting;
        state.downloadVoiceMailError = null;
    },
    downloadVoiceMailSucceeded(state) {
        state.downloadVoiceMailState = RequestState.succeeded;
        state.downloadVoiceMailError = null;
    },
    downloadVoiceMailFailed(state, error) {
        state.downloadVoiceMailState = RequestState.failed;
        state.downloadVoiceMailError = error;
    },
    downloadFaxRequesting(state) {
        state.downloadFaxState = RequestState.requesting;
        state.downloadFaxError = null;
    },
    downloadFaxSucceeded(state) {
        state.downloadFaxState = RequestState.succeeded;
        state.downloadFaxError = null;
    },
    downloadFaxFailed(state, error) {
        state.downloadFaxState = RequestState.failed;
        state.downloadFaxError = error;
    },
    reloadItemsRequesting(state) {
        state.reloadItemsState = RequestState.requesting;
        state.reloadItemsError = null;
        state.itemsReloaded = false;
    },
    reloadItemsSucceeded(state, items) {
        state.reloadItemsState = RequestState.succeeded;
        state.reloadItemsError = null;
        state.items = items.items;
        linkCallsWithSameId(state);
        state.itemsReloaded = true;
    },
    reloadItemsFailed(state, error) {
        state.reloadItemsState = RequestState.failed;
        state.reloadItemsError = error;
    },
    playVoiceMailRequesting(state, id) {
        Vue.set(state.playVoiceMailStates, id, RequestState.requesting);
        Vue.set(state.playVoiceMailErrors, id, null);
    },
    playVoiceMailSucceeded(state, options) {
        Vue.set(state.playVoiceMailUrls, options.id, options.url);
        Vue.set(state.playVoiceMailStates, options.id, RequestState.succeeded);
        Vue.set(state.playVoiceMailErrors, options.id, null);
    },
    playVoiceMailFailed(state, id, err) {
        Vue.set(state.playVoiceMailUrls, id, null);
        Vue.set(state.playVoiceMailStates, id, RequestState.failed);
        Vue.set(state.playVoiceMailErrors, id, err);
    },
    resetList(state) {
        state.items = [];
        state.currentPage = 0;
        state.reachedLastPage = false;
    },
    nextPageRequesting(state) {
        state.nextPageState = RequestState.requesting;
        state.nextPageError = null;
    },
    nextPageSucceeded(state, items) {
        state.nextPageState = RequestState.succeeded;
        state.nextPageError = null;
        state.items = state.items.concat(items.items);
        state.reachedLastPage = items.items.length === 0;
        state.currentPage = state.currentPage + 1;
        linkCallsWithSameId(state);
    },
    nextPageFailed(state, error) {
        state.nextPageState = RequestState.failed;
        state.nextPageError = error;
    },
    blockedIncomingRequesting(state) {
        state.blockedIncomingState = RequestState.requesting;
        state.blockedIncomingError = null;
        state.blockedModeIncoming = null;
        state.blockedNumbersIncoming = new Set();
    },
    blockedIncomingSucceeded(state, options) {
        let mode = options.enabled ? 'whitelist' : 'blacklist';
        let numbers = options.list ? options.list : [];
        let numberSet = new Set(numbers);
        state.blockedIncomingState = RequestState.succeeded;
        state.blockedIncomingError = null;
        state.blockedNumbersIncoming = numberSet;
        state.blockedModeIncoming = mode;
    },
    blockedIncomingFailed(state, error) {
        state.blockedIncomingState = RequestState.failed;
        state.blockedIncomingError = error;
    },
    blockedOutgoingRequesting(state) {
        state.blockedOutgoingState = RequestState.requesting;
        state.blockedOutgoingError = null;
    },
    blockedOutgoingSucceeded(state, options) {
        let mode = options.enabled ? 'whitelist' : 'blacklist';
        let numbers = options.list ? options.list : [];
        let numberSet = new Set(numbers);
        state.blockedOutgoingState = RequestState.succeeded;
        state.blockedOutgoingError = null;
        state.blockedNumbersOutgoing = numberSet;
        state.blockedModeOutgoing = mode;
    },
    blockedOutgoingFailed(state, error) {
        state.blockedOutgoingState = RequestState.failed;
        state.blockedOutgoingError = error;
    },
    toggleBlockedRequesting(state) {
        state.toggleBlockedState = RequestState.requesting;
        state.toggleBlockedError = null;
    },
    toggleBlockedSucceeded(state, type) {
        let typePastTense = type ? type + 'ed' : 'toggled';
        state.toggleBlockedState = RequestState.succeeded;
        state.toggleBlockedError = null;
        state.lastToggledType = typePastTense;
    },
    toggleBlockedFailed(state, error, type) {
        let typePastTense = type ? type + 'ed' : 'toggled';
        state.toggleBlockedState = RequestState.failed;
        state.toggleBlockedError = error;
        state.lastToggledType = typePastTense;
    },
    deletionRequesting(state) {
        state.deletionState = RequestState.requesting
        state.deletionError = null
    },
    deletionSucceeded(state) {
        state.deletionState = RequestState.succeeded
        state.deletionError = null
    },
    deletionFailed(state, err) {
        state.deletionState = RequestState.failed
        state.deletionError = err
    }
}
