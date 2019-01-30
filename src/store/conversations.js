'use strict';

import Vue from 'vue';
import _ from 'lodash';
import { i18n } from '../i18n';
import {
    getConversations,
    downloadVoiceMail,
    downloadFax,
    playVoiceMail,
    getIncomingBlocked,
    getOutgoingBlocked
} from '../api/conversations'
import {
    //addNumberToIncomingList,
    //addNumberToOutgoingList,
    //removeNumberFromIncomingList,
    //removeNumberFromOutgoingList
} from '../api/call-blocking'

const ROWS_PER_PAGE = 15;

const RequestState = {
    button: 'button',
    requesting: 'requesting',
    succeeded: 'succeeded',
    failed: 'failed'
};

const ReloadConfig = {
    retryLimit: 5,
    retryDelay: 5000
};

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
    namespaced: true,
    state: {
        page: 1,
        rows: 10,
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
        blockedOutgoingError: null
    },
    getters: {
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
        callerIsBlockedIncoming(state) {
            return (number) => {
                if (state.blockedModeIncoming === 'whitelist') {
                    return !state.blockedNumbersIncoming.has(number);
                }
                else {
                    return state.blockedNumbersIncoming.has(number);
                }
            }
        },
        callerIsBlockedOutgoing(state) {
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
        isBlockedIncomingWhitelist(state) {
            return state.blockedModeIncoming === 'whitelist';
        },
        isBlockedOutgoingWhitelist(state) {
            return state.blockedModeOutgoing === 'whitelist';
        }
    },
    mutations: {
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
        }
    },
    actions: {
        reloadItems(context, options) {
            context.commit('reloadItemsRequesting');
            let rows = context.state.currentPage * ROWS_PER_PAGE;
            let firstStateItemTimestamp = context.state.items[0] ?
                context.state.items[0].start_time : null;
            if (options.retryCount < ReloadConfig.retryLimit) {
                getConversations({
                    subscriberId: context.getters.getSubscriberId,
                    page: 1,
                    rows: rows,
                    type: options.type
                }).then((result) => {
                    let firstResultItemTimestamp = result.items[0] ?
                        result.items[0].start_time : null;
                    if (_.isEqual(firstStateItemTimestamp, firstResultItemTimestamp)) {
                        setTimeout(() => {
                            context.dispatch('reloadItems', {
                                retryCount: ++options.retryCount,
                                type: options.type
                            });
                        }, ReloadConfig.retryDelay);
                    }
                    else {
                        context.commit('reloadItemsSucceeded', result);
                    }
                }).catch((err) => {
                    context.commit('reloadItemsFailed', err.message);
                });
            }
        },
        downloadVoiceMail(context, id) {
            context.commit('downloadVoiceMailRequesting');
            downloadVoiceMail(id).then(() => {
                context.commit('downloadVoiceMailSucceeded');
            }).catch((err) => {
                context.commit('downloadVoiceMailFailed', err.body.message);
            });
        },
        downloadFax(context, id) {
            context.commit('downloadFaxRequesting');
            downloadFax(id).then(() => {
                context.commit('downloadFaxSucceeded');
            }).catch((err)=>{
                context.commit('downloadFaxFailed', err.body.message);
            });
        },
        playVoiceMail(context, options) {
            context.commit('playVoiceMailRequesting', options.id);
            playVoiceMail(options).then((url) => {
                context.commit('playVoiceMailSucceeded', {
                    id: options.id,
                    url: url
                });
            }).catch((err) => {
                context.commit('playVoiceMailFailed', options.id, err.mesage);
            });
        },
        nextPage(context, type) {
            if (!context.getters.isLastPage) {
                context.commit('nextPageRequesting');
                getConversations({
                    subscriberId: context.getters.getSubscriberId,
                    page: context.getters.currentPage + 1,
                    rows: ROWS_PER_PAGE,
                    type: type
                }).then((result) => {
                    context.commit('nextPageSucceeded', result);
                }).catch((err)=>{
                    context.commit('nextPageFailed', err.message);
                });
            }
        },
        getBlockedNumbersIncoming(context) {
            let id = context.getters.getSubscriberId;
            context.commit('blockedIncomingRequesting');
            getIncomingBlocked(id).then((data) => {
                context.commit('blockedIncomingSucceeded', data);
            }).catch((err)=>{
                context.commit('blockedIncomingFailed', err.message);
            });
        },
        getBlockedNumbersOutgoing(context) {
            let id = context.getters.getSubscriberId;
            context.commit('blockedOutgoingRequesting');
            getOutgoingBlocked(id).then((data) => {
                context.commit('blockedOutgoingSucceeded', data);
            }).catch((err)=>{
                context.commit('blockedOutgoingFailed', err.message);
            });
        },
        getBlockedNumbers(context) {
            context.dispatch('getBlockedNumbersIncoming');
            context.dispatch('getBlockedNumbersOutgoing');
        },
        toggleBlockIncoming(context, number) {
            let id = context.getters.getSubscriberId;
            // NOTE: Not fetching fresh blocked mode state before making api
            // request, as they're intention to block/unblock was based on the
            // store truth at moment of action. Fetching new state is also not
            // affecting the add/remove logic (worst case we remove a blocked
            // number that already has been removed)
            // TODO:
            // if (whitelist incoming) then {add number to incoming block list}
            // else (!whitelist incoming) then {remove number from incoming block list}
            console.log('getter incoming', context.getters.isBlockedIncomingWhitelist);
            console.log('block incoming for number', number, 'subscriber', id);
        },
        toggleBlockOutgoing(context, number) {
            let id = context.getters.getSubscriberId;
            console.log('getter outgoing', context.getters.isBlockedOutgoingWhitelist);
            console.log('block outgoing for number', number, 'subscriber', id);
        },
        toggleBlockBoth(context, number) {
            context.dispatch('toggleBlockIncoming', number)
            context.dispatch('toggleBlockOutgoing', number)
        }
    }
};
