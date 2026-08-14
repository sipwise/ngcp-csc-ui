'use strict'

import {
    addNumberToIncomingList,
    addNumberToOutgoingList,
    disableIncomingCallBlocking,
    disableOutgoingCallBlocking,
    editNumberFromIncomingList,
    editNumberFromOutgoingList,
    enableIncomingCallBlocking,
    enableOutgoingCallBlocking,
    getIncomingCallBlocking,
    getOutgoingCallBlocking,
    getPrivacyCallBlocking,
    removeNumberFromIncomingList,
    removeNumberFromOutgoingList
} from 'src/api/call-blocking'
import {
    allowAnonymous,
    blockAnonymous,
    setPrivacy
} from 'src/api/subscriber'
import { getSubscriberId } from 'src/auth'
import { RequestState } from 'src/store/common'

export default {
    namespaced: true,
    state: {
        blockAnonymous: null,
        enabled: false,
        list: [],
        privacy: false,
        privacyLoadingState: RequestState.initiated,
        privacyUpdated: false,
        privacyError: null,
        toggleState: RequestState.initiated,
        toggleBlockAnonymousState: RequestState.initiated,
        addNumberState: RequestState.initiated,
        editNumberState: RequestState.initiated,
        removeNumberState: RequestState.initiated,
        numberListState: RequestState.initiated,
        currentNumberIndex: null
    },
    getters: {
        privacy (state) {
            return state.privacy
        },
        privacyError (state) {
            return state.privacyError
        },
        privacyUpdated (state) {
            return state.privacyUpdated
        },
        privacyLoadingState (state) {
            return state.privacyUpdated
        },
        privacyLoading (state) {
            return state.privacyLoadingState === RequestState.requesting
        },
        toggleState (state) {
            return state.toggleState
        },
        isToggleLoading (state) {
            return state.toggleState === RequestState.requesting
        },
        addNumberState (state) {
            return state.addNumberState
        },
        isAddNumberLoading (state) {
            return state.addNumberState === RequestState.requesting
        },
        editNumberState (state) {
            return state.editNumberState
        },
        isEditNumberLoading (state) {
            return state.editNumberState === RequestState.requesting
        },
        removeNumberState (state) {
            return state.editNumberState
        },
        isRemoveNumberLoading (state) {
            return state.removeNumberState === RequestState.requesting
        },
        numberListState (state) {
            return state.numberListState
        },
        isNumberListLoading (state) {
            return state.numberListState === RequestState.requesting
        },
        numbers (state) {
            return state.list
        },
        currentNumberIndex (state) {
            return state.currentNumberIndex
        },
        listMode (state) {
            if (state.enabled) {
                return 'whitelist'
            }
            return 'blacklist'
        },
        isAnonymousBlocked (state) {
            return state.blockAnonymous === true
        },
        isAnonymousBlockRequesting (state) {
            return state.toggleBlockAnonymousState === RequestState.requesting
        }
    },
    mutations: {
        privacyLoading (state) {
            state.privacyLoadingState = RequestState.requesting
            state.privacyError = null
            state.privacyUpdated = false
        },
        privacyLoaded (state, privacy) {
            state.privacy = privacy
            state.privacyLoadingState = RequestState.succeeded
            state.privacyError = null
        },
        privacyLoadingFailed (state, error) {
            state.privacyLoadingState = RequestState.failed
            state.privacyError = error
        },
        privacyUpdated (state, privacy) {
            state.privacy = privacy
            state.privacyLoadingState = RequestState.succeeded
            state.privacyError = null
            state.privacyUpdated = true
        },
        privacyUpdatingFailed (state, error) {
            state.privacyLoadingState = RequestState.failed
            state.privacyError = error
            state.privacyUpdated = true
        },
        toggleRequesting (state) {
            state.toggleState = RequestState.requesting
        },
        toggleSucceeded (state, enabled) {
            state.enabled = enabled
            state.toggleState = RequestState.succeeded
        },
        toggleFailed (state) {
            state.toggleState = RequestState.failed
        },
        addNumberRequesting (state) {
            state.addNumberState = RequestState.requesting
        },
        addNumberSucceeded (state) {
            state.addNumberState = RequestState.succeeded
        },
        addNumberFailed (state) {
            state.addNumberState = RequestState.failed
        },
        editNumberRequesting (state, options) {
            state.editNumberState = RequestState.requesting
            state.currentNumberIndex = options.index
        },
        editNumberSucceeded (state) {
            state.editNumberState = RequestState.succeeded
        },
        editNumberFailed (state) {
            state.editNumberState = RequestState.failed
        },
        removeNumberRequesting (state, index) {
            state.removeNumberState = RequestState.requesting
            state.currentNumberIndex = index
        },
        removeNumberSucceeded (state) {
            state.removeNumberState = RequestState.succeeded
        },
        removeNumberFailed (state) {
            state.removeNumberState = RequestState.failed
        },
        numberListRequesting (state) {
            state.numberListState = RequestState.requesting
            state.list = []
        },
        numberListSucceeded (state, options) {
            state.numberListState = RequestState.succeeded
            state.enabled = options.enabled
            state.list = options.list
            state.blockAnonymous = options.blockAnonymous
        },
        numberListFailed (state) {
            state.numberListState = RequestState.failed
        },
        toggleBlockAnonymousRequesting (state) {
            state.toggleBlockAnonymousState = RequestState.requesting
        },
        toggleBlockAnonymousSucceeded (state, blockAnonymous) {
            state.blockAnonymous = blockAnonymous
            state.toggleBlockAnonymousState = RequestState.succeeded
        },
        toggleBlockAnonymousFailed (state) {
            state.toggleBlockAnonymousState = RequestState.failed
        }
    },
    actions: {
        toggleIncoming (context, enabled) {
            context.commit('toggleRequesting')
            Promise.resolve().then(() => {
                if (enabled) {
                    return enableIncomingCallBlocking(getSubscriberId())
                }
                return disableIncomingCallBlocking(getSubscriberId())
            }).then(() => {
                context.commit('toggleSucceeded', enabled)
            }).catch((err) => {
                context.commit('toggleFailed', err.message)
            })
        },
        loadIncoming (context) {
            context.commit('numberListRequesting')
            Promise.resolve().then(() => {
                return getIncomingCallBlocking(getSubscriberId())
            }).then((result) => {
                context.commit('numberListSucceeded', result)
            }).catch((err) => {
                context.commit('numberListFailed', err.message)
            })
        },
        addNumberIncoming (context, number) {
            context.commit('addNumberRequesting')
            Promise.resolve().then(() => {
                return addNumberToIncomingList(getSubscriberId(), number)
            }).then(() => {
                return getIncomingCallBlocking(getSubscriberId())
            }).then((result) => {
                context.commit('numberListSucceeded', result)
                context.commit('addNumberSucceeded')
            }).catch((err) => {
                context.commit('addNumberFailed', err.message)
            })
        },
        editNumberIncoming (context, options) {
            context.commit('editNumberRequesting', options)
            Promise.resolve().then(() => {
                return editNumberFromIncomingList(getSubscriberId(),
                    options.index, options.number)
            }).then(() => {
                return getIncomingCallBlocking(getSubscriberId())
            }).then((result) => {
                context.commit('numberListSucceeded', result)
                context.commit('editNumberSucceeded')
            }).catch((err) => {
                context.commit('editNumberFailed', err.message)
            })
        },
        removeNumberIncoming (context, index) {
            context.commit('removeNumberRequesting', index)
            Promise.resolve().then(() => {
                return removeNumberFromIncomingList(getSubscriberId(), index)
            }).then(() => {
                return getIncomingCallBlocking(getSubscriberId())
            }).then((result) => {
                context.commit('numberListSucceeded', result)
                context.commit('removeNumberSucceeded')
            }).catch((err) => {
                context.commit('removeNumberFailed', err.message)
            })
        },
        toggleOutgoing (context, enabled) {
            context.commit('toggleRequesting')
            Promise.resolve().then(() => {
                if (enabled) {
                    return enableOutgoingCallBlocking(getSubscriberId())
                }
                return disableOutgoingCallBlocking(getSubscriberId())
            }).then(() => {
                context.commit('toggleSucceeded', enabled)
            }).catch((err) => {
                context.commit('toggleFailed', err.message)
            })
        },
        loadOutgoing (context) {
            context.commit('numberListRequesting')
            Promise.resolve().then(() => {
                return getOutgoingCallBlocking(getSubscriberId())
            }).then((result) => {
                context.commit('numberListSucceeded', result)
            }).catch((err) => {
                context.commit('numberListFailed', err.message)
            })
        },
        addNumberOutgoing (context, number) {
            context.commit('addNumberRequesting')
            Promise.resolve().then(() => {
                return addNumberToOutgoingList(getSubscriberId(), number)
            }).then(() => {
                return getOutgoingCallBlocking(getSubscriberId())
            }).then((result) => {
                context.commit('numberListSucceeded', result)
                context.commit('addNumberSucceeded')
            }).catch((err) => {
                context.commit('addNumberFailed', err.message)
            })
        },
        editNumberOutgoing (context, options) {
            context.commit('editNumberRequesting', options)
            Promise.resolve().then(() => {
                return editNumberFromOutgoingList(getSubscriberId(),
                    options.index, options.number)
            }).then(() => {
                return getOutgoingCallBlocking(getSubscriberId())
            }).then((result) => {
                context.commit('numberListSucceeded', result)
                context.commit('editNumberSucceeded')
            }).catch((err) => {
                context.commit('editNumberFailed', err.message)
            })
        },
        removeNumberOutgoing (context, index) {
            context.commit('removeNumberRequesting', index)
            Promise.resolve().then(() => {
                return removeNumberFromOutgoingList(getSubscriberId(), index)
            }).then(() => {
                return getOutgoingCallBlocking(getSubscriberId())
            }).then((result) => {
                context.commit('numberListSucceeded', result)
                context.commit('removeNumberSucceeded')
            }).catch((err) => {
                context.commit('removeNumberFailed', err.message)
            })
        },
        updatePrivacy (context, privacy) {
            context.commit('privacyLoading')
            setPrivacy(getSubscriberId(), privacy).then(() => {
                context.commit('privacyUpdated', privacy)
            }).catch((err) => {
                context.commit('privacyUpdatingFailed', err.message)
            })
        },
        loadPrivacy (context) {
            context.commit('privacyLoading')
            getPrivacyCallBlocking(getSubscriberId()).then((privacy) => {
                context.commit('privacyLoaded', privacy)
            }).catch((err) => {
                context.commit('privacyLoadingFailed', err.message)
            })
        },
        toggleBlockAnonymous (context, blocked) {
            let action = null
            if (blocked) {
                action = blockAnonymous(getSubscriberId())
            } else {
                action = allowAnonymous(getSubscriberId())
            }
            context.commit('toggleBlockAnonymousRequesting')
            action.then(() => {
                context.commit('toggleBlockAnonymousSucceeded', blocked)
            }).catch((err) => {
                context.commit('toggleBlockAnonymousFailed', err.message)
            })
        }
    }
}
