import {
    deleteVoicemail,
    downloadFax,
    downloadVoiceMail,
    getConversations,
    getIncomingBlocked,
    getOutgoingBlocked,
    playVoiceMail,
    deleteFax
} from 'src/api/conversations'
import _ from 'lodash'
import {
    addNumberToIncomingList,
    addNumberToOutgoingList,
    removeFromIncomingListByNumber,
    removeFromOutgoingListByNumber,
    toggleNumberInBothLists
} from 'src/api/call-blocking'
import { LIST_DEFAULT_ROWS } from 'src/api/common'

export const ROWS_PER_PAGE = LIST_DEFAULT_ROWS

const ReloadConfig = {
    retryLimit: 5,
    retryDelay: 5000
}

export default {
    reloadItems (context, options) {
        context.commit('reloadItemsRequesting')
        const rows = context.state.currentPage * ROWS_PER_PAGE
        const firstStateItemTimestamp = context.state.items[0]
            ? context.state.items[0].start_time
            : null
        if (options.retryCount < ReloadConfig.retryLimit) {
            getConversations({
                subscriberId: context.getters.getSubscriberId,
                page: 1,
                rows: rows,
                type: options.type
            }).then((result) => {
                const firstResultItemTimestamp = result.items[0]
                    ? result.items[0].start_time
                    : null
                if (_.isEqual(firstStateItemTimestamp, firstResultItemTimestamp)) {
                    setTimeout(() => {
                        context.dispatch('reloadItems', {
                            retryCount: ++options.retryCount,
                            type: options.type
                        })
                    }, ReloadConfig.retryDelay)
                } else {
                    context.commit('reloadItemsSucceeded', result)
                }
            }).catch((err) => {
                context.commit('reloadItemsFailed', err.message)
            })
        }
    },
    downloadVoiceMail (context, id) {
        context.commit('downloadVoiceMailRequesting')
        downloadVoiceMail(id).then(() => {
            context.commit('downloadVoiceMailSucceeded')
        }).catch((err) => {
            context.commit('downloadVoiceMailFailed', err.response.data.message)
        })
    },
    downloadFax (context, id) {
        context.commit('downloadFaxRequesting')
        downloadFax(id).then(() => {
            context.commit('downloadFaxSucceeded')
        }).catch((err) => {
            context.commit('downloadFaxFailed', err.response.data.message)
        })
    },
    playVoiceMail (context, options) {
        context.commit('playVoiceMailRequesting', options.id)
        playVoiceMail(options).then((url) => {
            context.commit('playVoiceMailSucceeded', {
                id: options.id,
                url: url
            })
        }).catch((err) => {
            context.commit('playVoiceMailFailed', options.id, err.mesage)
        })
    },
    async nextPage (context, options) {
        let res
        try {
            context.commit('nextPageRequesting')
            res = await getConversations({
                subscriberId: context.getters.getSubscriberId,
                page: options.index,
                rows: ROWS_PER_PAGE,
                type: options.type,
                from: _.get(options, 'filter.from', ''),
                to: _.get(options, 'filter.to', ''),
                direction: _.get(options, 'filter.direction', ''),
                caller: _.get(options, 'filter.caller', ''),
                callee: _.get(options, 'filter.callee', ''),
                wildcards: true
            })
            context.commit('nextPageSucceeded', res)
        } catch (err) {
            context.commit('nextPageFailed', err.message)
        } finally {
            if (typeof options.done === 'function') {
                if (res?.items === undefined || res?.items?.length === 0 || res?.items?.length < ROWS_PER_PAGE) {
                    options.done(true)
                } else {
                    options.done()
                }
            }
        }
    },
    getBlockedNumbersIncoming (context) {
        const id = context.getters.getSubscriberId
        context.commit('blockedIncomingRequesting')
        getIncomingBlocked(id).then((data) => {
            context.commit('blockedIncomingSucceeded', data)
        }).catch((err) => {
            context.commit('blockedIncomingFailed', err.message)
        })
    },
    getBlockedNumbersOutgoing (context) {
        const id = context.getters.getSubscriberId
        context.commit('blockedOutgoingRequesting')
        getOutgoingBlocked(id).then((data) => {
            context.commit('blockedOutgoingSucceeded', data)
        }).catch((err) => {
            context.commit('blockedOutgoingFailed', err.message)
        })
    },
    async getBlockedNumbers (context) {
        await Promise.all([
            context.dispatch('getBlockedNumbersIncoming'),
            context.dispatch('getBlockedNumbersOutgoing')
        ])
    },
    async toggleBlockIncoming (context, options) {
        const id = context.getters.getSubscriberId
        const isWhitelist = context.getters.isNumberIncomingWhitelisted
        const isBlocked = context.getters.isNumberIncomingBlocked(options.number)
        context.commit('toggleBlockedRequesting')
        if ((isBlocked && isWhitelist) || (!isBlocked && !isWhitelist)) {
            try {
                await addNumberToIncomingList(id, options.number)
                context.commit('toggleBlockedSucceeded', options.type)
                await context.dispatch('getBlockedNumbersIncoming')
            } catch (err) {
                context.commit('toggleBlockedFailed', err.message, options.type)
            }
        } else if ((isBlocked && !isWhitelist) || (!isBlocked && isWhitelist)) {
            try {
                await removeFromIncomingListByNumber(id, options.number)
                context.commit('toggleBlockedSucceeded', options.type)
                await context.dispatch('getBlockedNumbersIncoming')
            } catch (err) {
                context.commit('toggleBlockedFailed', err.message, options.type)
            }
        } else {
            context.commit('toggleBlockedFailed', 'error while identifying blocked condition', options.type)
        }
    },
    async toggleBlockOutgoing (context, options) {
        const id = context.getters.getSubscriberId
        const isWhitelist = context.getters.isNumberOutgoingWhitelisted
        const isBlocked = context.getters.isNumberOutgoingBlocked(options.number)
        context.commit('toggleBlockedRequesting')
        if ((isBlocked && isWhitelist) || (!isBlocked && !isWhitelist)) {
            try {
                await addNumberToOutgoingList(id, options.number)
                context.commit('toggleBlockedSucceeded', options.type)
                await context.dispatch('getBlockedNumbersOutgoing')
            } catch (err) {
                context.commit('toggleBlockedFailed', err.message, options.type)
            }
        } else if ((isBlocked && !isWhitelist) || (!isBlocked && isWhitelist)) {
            try {
                await removeFromOutgoingListByNumber(id, options.number)
                context.commit('toggleBlockedSucceeded', options.type)
                await context.dispatch('getBlockedNumbersOutgoing')
            } catch (err) {
                context.commit('toggleBlockedFailed', err.message, options.type)
            }
        } else {
            context.commit('toggleBlockedFailed', 'error while identifying blocked condition', options.type)
        }
    },
    toggleBlockBoth (context, options) {
        const id = context.getters.getSubscriberId
        const inAction = context.getters.actionToToggleIncomingNumber(options.number)
        const outAction = context.getters.actionToToggleOutgoingNumber(options.number)
        context.commit('toggleBlockedRequesting')
        toggleNumberInBothLists({
            id: id,
            number: options.number,
            block_in_list: inAction,
            block_out_list: outAction
        }).then(() => {
            context.commit('toggleBlockedSucceeded', options.type)
        }).then(() => {
            context.dispatch('getBlockedNumbersIncoming')
            context.dispatch('getBlockedNumbersOutgoing')
        }).catch((err) => {
            context.commit('toggleBlockedFailed', err.message, options.type)
        })
    },
    async deleteVoicemail (context, options) {
        context.commit('deletionRequesting')
        try {
            await deleteVoicemail(options.id)
            context.commit('deletionSucceeded')
        } catch (err) {
            context.commit('deletionFailed', err.message)
        }
    },
    async deleteFax (context, options) {
        context.commit('deletionRequesting')
        try {
            await deleteFax(options.id)
            context.commit('deletionSucceeded')
        } catch (err) {
            context.commit('deletionFailed', err.message)
        }
    }
}
