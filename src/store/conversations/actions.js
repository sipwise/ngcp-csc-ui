import {
    deleteVoicemail,
    downloadFax,
    downloadVoiceMail,
    getConversations,
    getIncomingBlocked,
    getOutgoingBlocked,
    playVoiceMail
} from "../../api/conversations";
import _ from "lodash";
import {
    addNumberToIncomingList,
    addNumberToOutgoingList,
    removeFromIncomingListByNumber,
    removeFromOutgoingListByNumber,
    toggleNumberInBothLists
} from "../../api/call-blocking";

const ROWS_PER_PAGE = 15;

const ReloadConfig = {
    retryLimit: 5,
    retryDelay: 5000
}

export default {
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
    toggleBlockIncoming(context, options) {
        let id = context.getters.getSubscriberId;
        let isWhitelist = context.getters.isNumberIncomingWhitelisted;
        let isBlocked = context.getters.isNumberIncomingBlocked(options.number);
        context.commit('toggleBlockedRequesting');
        if ((isBlocked && isWhitelist) || (!isBlocked && !isWhitelist)) {
            addNumberToIncomingList(id, options.number).then(() => {
                context.commit('toggleBlockedSucceeded', options.type);
            }).then(() => {
                context.dispatch('getBlockedNumbersIncoming');
            }).then(() => {
                context.commit('resetList');
                context.dispatch('nextPage', null);
            }).catch((err) => {
                context.commit('toggleBlockedFailed', err.message, options.type);
            });
        }
        else if ((isBlocked && !isWhitelist) || (!isBlocked && isWhitelist)) {
            removeFromIncomingListByNumber(id, options.number).then(() => {
                context.commit('toggleBlockedSucceeded', options.type);
            }).then(() => {
                context.dispatch('getBlockedNumbersIncoming');
            }).then(() => {
                context.commit('resetList');
                context.dispatch('nextPage', null);
            }).catch((err) => {
                context.commit('toggleBlockedFailed', err.message, options.type);
            });
        }
        else {
            context.commit('toggleBlockedFailed', 'error while identifying blocked condition', options.type);
        }
    },
    toggleBlockOutgoing(context, options) {
        let id = context.getters.getSubscriberId;
        let isWhitelist = context.getters.isNumberOutgoingWhitelisted;
        let isBlocked = context.getters.isNumberOutgoingBlocked(options.number);
        context.commit('toggleBlockedRequesting');
        if ((isBlocked && isWhitelist) || (!isBlocked && !isWhitelist)) {
            addNumberToOutgoingList(id, options.number).then(() => {
                context.commit('toggleBlockedSucceeded', options.type);
            }).then(() => {
                context.dispatch('getBlockedNumbersOutgoing');
            }).then(() => {
                context.commit('resetList');
                context.dispatch('nextPage', null);
            }).catch((err) => {
                context.commit('toggleBlockedFailed', err.message, options.type);
            });
        }
        else if ((isBlocked && !isWhitelist) || (!isBlocked && isWhitelist)) {
            removeFromOutgoingListByNumber(id, options.number).then(() => {
                context.commit('toggleBlockedSucceeded', options.type);
            }).then(() => {
                context.dispatch('getBlockedNumbersOutgoing');
            }).then(() => {
                context.commit('resetList');
                context.dispatch('nextPage', null);
            }).catch((err) => {
                context.commit('toggleBlockedFailed', err.message, options.type);
            });
        }
        else {
            context.commit('toggleBlockedFailed', 'error while identifying blocked condition', options.type);
        }
    },
    toggleBlockBoth(context, options) {
        let id = context.getters.getSubscriberId;
        let inAction = context.getters.actionToToggleIncomingNumber(options.number);
        let outAction = context.getters.actionToToggleOutgoingNumber(options.number);
        context.commit('toggleBlockedRequesting');
        toggleNumberInBothLists({
            id: id,
            number: options.number,
            block_in_list: inAction,
            block_out_list: outAction
        }).then(() => {
            context.commit('toggleBlockedSucceeded', options.type);
        }).then(() => {
            context.dispatch('getBlockedNumbersIncoming');
            context.dispatch('getBlockedNumbersOutgoing');
        }).then(() => {
            context.commit('resetList');
            context.dispatch('nextPage', null);
        }).catch((err) => {
            context.commit('toggleBlockedFailed', err.message, options.type);
        });
    },
    async deleteVoicemail(context, options) {
        context.commit('deletionRequesting')
        try {
            await deleteVoicemail(options.id)
            context.commit('deletionSucceeded')
            context.commit('resetList')
            await context.dispatch('nextPage', options.tab)
        }
        catch (err) {
            context.commit('deletionFailed', err.message)
        }
    }
}
