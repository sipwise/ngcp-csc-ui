import {
    i18n
} from "../../i18n";
import {
    RequestState
} from '../common'

export default {
    getSubscriberId(state, getters, rootState, rootGetters) {
        return rootGetters['user/getSubscriberId'];
    },
    reloadItemsState(state) {
        return state.reloadItemsState;
    },
    reloadItemsError(state) {
        return state.reloadItemsError ||
            i18n.t('pages.conversations.reloadItemsErrorMessage');
    },
    playVoiceMailState(state) {
        return (id) => {
            return state.playVoiceMailStates[id];
        }
    },
    playVoiceMailUrl(state) {
        return (id) => {
            return state.playVoiceMailUrls[id];
        }
    },
    currentPage(state) {
        return state.currentPage;
    },
    isLastPage(state) {
        return state.reachedLastPage;
    },
    rowsAlreadyLoaded(state) {
        return state.items.length;
    },
    items(state) {
        return state.items;
    },
    isNextPageRequesting(state) {
        return state.nextPageState === RequestState.requesting;
    },
    downloadFaxState(state) {
        return state.downloadFaxState;
    },
    downloadVoiceMailState(state) {
        return state.downloadVoiceMailState;
    },
    downloadFaxError(state) {
        return state.downloadFaxError;
    },
    downloadVoiceMailError(state) {
        return state.downloadVoiceMailError;
    },
    itemsReloaded(state) {
        return state.itemsReloaded;
    },
    isNumberIncomingBlocked(state) {
        return (number) => {
            if (state.blockedModeIncoming === 'whitelist') {
                return !state.blockedNumbersIncoming.has(number);
            }
            else {
                return state.blockedNumbersIncoming.has(number);
            }
        }
    },
    isNumberOutgoingBlocked(state) {
        return (number) => {
            if (state.blockedModeOutgoing === 'whitelist') {
                return !state.blockedNumbersOutgoing.has(number);
            }
            else {
                return state.blockedNumbersOutgoing.has(number);
            }
        }
    },
    blockedNumbersIncoming(state) {
        return state.blockedNumbersIncoming;
    },
    blockedNumbersOutgoing(state) {
        return state.blockedNumbersOutgoing;
    },
    blockedIncomingLoaded(state) {
        return state.blockedIncomingState === RequestState.succeeded;
    },
    blockedOutgoingLoaded(state) {
        return state.blockedOutgoingState === RequestState.succeeded;
    },
    isNumberIncomingWhitelisted(state) {
        return state.blockedModeIncoming === 'whitelist';
    },
    isNumberOutgoingWhitelisted(state) {
        return state.blockedModeOutgoing === 'whitelist';
    },
    actionToToggleIncomingNumber(state) {
        return (number) => {
            if (state.blockedNumbersIncoming.has(number)) {
                return 'remove';
            }
            else {
                return 'add';
            }
        }
    },
    actionToToggleOutgoingNumber(state) {
        return (number) => {
            if (state.blockedNumbersOutgoing.has(number)) {
                return 'remove';
            }
            else {
                return 'add';
            }
        }
    },
    toggleBlockedState(state) {
        return state.toggleBlockedState;
    },
    lastToggledType(state) {
        return state.lastToggledType;
    }
}
