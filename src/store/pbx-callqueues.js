import { i18n } from 'boot/i18n'
import _ from 'lodash'
import {
    createCallQueue,
    getCallQueueList,
    removeCallQueue,
    setCallQueueMaxLength,
    setCallQueueWrapUpTime
} from 'src/api/pbx-callqueues'
import { CreationState, RequestState } from 'src/store/common'

export default {
    namespaced: true,
    state: {
        callQueueListState: RequestState.initiated,
        callQueueListVisible: true,
        callQueueList: [],
        callQueueMap: {},
        callQueueSelected: null,
        callQueueCreationState: CreationState.initiated,
        callQueueCreationData: null,
        callQueueCreationError: null,
        callQueueUpdateState: RequestState.initiated,
        callQueueUpdating: null,
        callQueueUpdatingField: null,
        callQueueUpdateError: null,
        callQueueRemovalState: RequestState.initiated,
        callQueueRemoving: null,
        callQueueRemovalError: null,
        subscriberMap: {},
        defaultMaxQueueLength: 5,
        defaultQueueWrapUpTime: 10
    },
    getters: {
        isCallQueueListEmpty (state) {
            return Array.isArray(state.callQueueList) && state.callQueueList.length === 0
        },
        isCallQueueListRequesting (state) {
            return state.callQueueListState === RequestState.requesting
        },
        isCallQueueAddFormEnabled (state) {
            return state.callQueueCreationState !== CreationState.initiated &&
                state.callQueueCreationState !== CreationState.created
        },
        isCallQueueCreating (state) {
            return state.callQueueCreationState === CreationState.creating
        },
        isCallQueueUpdating (state) {
            return state.callQueueUpdateState === RequestState.requesting
        },
        isCallQueueRemoving (state) {
            return state.callQueueRemoving === RequestState.requesting
        },
        isCallQueueLoading (state) {
            return (id) => {
                return (state.callQueueRemovalState === RequestState.requesting &&
                    state.callQueueRemoving !== null && state.callQueueRemoving.id === id) ||
                    (state.callQueueUpdateState === RequestState.requesting &&
                    state.callQueueUpdating !== null && state.callQueueUpdating.id === id)
            }
        },
        isCallQueueExpanded (state) {
            return (id) => {
                return state.callQueueSelected !== null && state.callQueueSelected.id === id
            }
        },
        getCallQueueRemoveDialogMessage (state) {
            if (state.callQueueRemoving !== null) {
                return i18n.global.tc('You are about to remove call queue for {subscriber}', {
                    subscriber: state.subscriberMap[state.callQueueRemoving.id].display_name
                })
            }
            return ''
        },
        getCallQueueRemovingName (state) {
            const subscriber = _.get(state.subscriberMap, _.get(state.callQueueRemoving, 'id', null), null)
            return _.get(subscriber, 'display_name', '')
        },
        getCallQueueCreatingName (state) {
            const subscriber = _.get(state.subscriberMap, _.get(state.callQueueCreationData, 'subscriber_id', null), null)
            return _.get(subscriber, 'display_name', '')
        },
        getCallQueueUpdatingName (state) {
            const subscriber = _.get(state.subscriberMap, _.get(state.callQueueUpdating, 'id', null), null)
            return _.get(subscriber, 'display_name', '')
        },
        getCallQueueUpdatingField (state) {
            return state.callQueueUpdatingField
        },
        getCallQueueCreationToastMessage (state, getters) {
            return i18n.global.tc('Created call queue for {callQueue} successfully', {
                callQueue: getters.getCallQueueCreatingName
            })
        },
        getCallQueueUpdateToastMessage (state, getters) {
            return i18n.global.tc('Updated {field} for call queue {callQueue} successfully', {
                callQueue: getters.getCallQueueUpdatingName,
                field: getters.getCallQueueUpdatingField
            })
        },
        getCallQueueRemovalToastMessage (state, getters) {
            return i18n.global.tc('Removed call queue for {callQueue} successfully', {
                callQueue: getters.getCallQueueRemovingName
            })
        }
    },
    mutations: {
        callQueueListRequesting (state, options) {
            state.callQueueListState = RequestState.requesting
            if (!options.listVisible) {
                state.callQueueList = []
                state.callQueueMap = {}
                state.callQueueListVisible = false
            } else {
                state.callQueueListVisible = true
            }
        },
        callQueueListSucceeded (state, callQueueList) {
            state.callQueueListState = RequestState.succeeded
            state.callQueueList = _.get(callQueueList, 'callQueues.items', [])
            state.callQueueList.forEach((callQueue) => {
                state.callQueueMap[callQueue.id] = callQueue
            })
            _.get(callQueueList, 'subscribers.items', []).forEach((subscriber) => {
                state.subscriberMap[subscriber.id] = subscriber
            })
            state.callQueueListVisible = true
        },
        callQueueCreationRequesting (state, data) {
            state.callQueueCreationState = CreationState.creating
            state.callQueueCreationData = data
        },
        callQueueCreationSucceeded (state) {
            state.callQueueCreationState = CreationState.created
        },
        callQueueCreationFailed (state, err) {
            state.callQueueCreationState = CreationState.error
            state.callQueueCreationError = err
        },
        callQueueRemovalRequesting (state, callQueueId) {
            state.callQueueRemovalState = RequestState.requesting
            if (callQueueId) {
                state.callQueueRemoving = state.callQueueMap[callQueueId]
            }
        },
        callQueueRemovalCanceled (state) {
            state.callQueueRemovalState = RequestState.initiated
            state.callQueueRemoving = null
        },
        callQueueRemovalSucceeded (state) {
            state.callQueueRemovalState = RequestState.succeeded
        },
        callQueueRemovalFailed (state, err) {
            state.callQueueRemovalState = RequestState.failed
            state.callQueueRemovalError = err
        },
        callQueueUpdateRequesting (state, options) {
            state.callQueueUpdateState = RequestState.requesting
            state.callQueueUpdating = state.callQueueMap[options.callQueueId]
            state.callQueueUpdatingField = options.field
        },
        callQueueUpdateSucceeded (state, preferences) {
            state.callQueueUpdateState = RequestState.succeeded
            if (preferences) {
                for (let i = 0; i < state.callQueueList.length; i++) {
                    if (state.callQueueList[i].id === preferences.id) {
                        state.callQueueList[i] = preferences
                    }
                }
                delete state.callQueueMap[preferences.id]
                state.callQueueMap[preferences.id] = preferences
            }
        },
        callQueueUpdateFailed (state, err) {
            state.callQueueUpdateState = RequestState.failed
            state.callQueueUpdateError = err
        },
        enableCallQueueAddForm (state) {
            state.callQueueCreationState = CreationState.input
        },
        disableCallQueueAddForm (state) {
            state.callQueueCreationState = CreationState.initiated
        },
        expandCallQueue (state, callQueueId) {
            state.callQueueSelected = state.callQueueMap[callQueueId]
        },
        collapseCallQueue (state) {
            state.callQueueSelected = null
        }
    },
    actions: {
        loadCallQueueList (context, options) {
            return new Promise((resolve) => {
                const listVisible = _.get(options, 'listVisible', false)
                const selectedId = _.get(options, 'selectedId', null)
                context.commit('callQueueListRequesting', {
                    listVisible
                })
                getCallQueueList().then((callQueueList) => {
                    context.commit('callQueueListSucceeded', callQueueList)
                    if (selectedId !== null) {
                        context.commit('expandCallQueue', callQueueList)
                        context.commit('highlightCallQueue', callQueueList)
                    }
                    resolve()
                }).catch(() => {
                    resolve()
                    context.commit('callQueueListSucceeded')
                })
            })
        },
        createCallQueue (context, callQueueData) {
            context.commit('callQueueCreationRequesting', callQueueData)
            createCallQueue(callQueueData).then(() => {
                return context.dispatch('loadCallQueueList', {
                    listVisible: true
                })
            }).then(() => {
                context.commit('callQueueCreationSucceeded')
            }).catch((err) => {
                // eslint-disable-next-line no-console
                console.debug(err)
                context.commit('callQueueCreationFailed', err.message)
            })
        },
        removeCallQueue (context) {
            context.commit('callQueueRemovalRequesting')
            removeCallQueue(context.state.callQueueRemoving.id).then(() => {
                return context.dispatch('loadCallQueueList', {
                    listVisible: true
                })
            }).then(() => {
                context.commit('callQueueRemovalSucceeded')
            }).catch((err) => {
                // eslint-disable-next-line no-console
                console.debug(err)
                context.commit('callQueueRemovalFailed', err.message)
            })
        },
        setCallQueueMaxLength (context, options) {
            context.commit('callQueueUpdateRequesting', {
                callQueueId: options.callQueueId,
                field: 'maxLength'
            })
            setCallQueueMaxLength(options).then((preferences) => {
                context.commit('callQueueUpdateSucceeded', preferences)
            }).catch((err) => {
                // eslint-disable-next-line no-console
                console.debug(err)
                context.commit('callQueueUpdateFailed', err.message)
            })
        },
        setCallQueueWrapUpTime (context, options) {
            context.commit('callQueueUpdateRequesting', {
                callQueueId: options.callQueueId,
                field: 'wrapUpTime'
            })
            setCallQueueWrapUpTime(options).then((preferences) => {
                context.commit('callQueueUpdateSucceeded', preferences)
            }).catch((err) => {
                // eslint-disable-next-line no-console
                console.debug(err)
                context.commit('callQueueUpdateFailed', err.message)
            })
        },
        jumpToCallQueue (context, subscriber) {
            this.$router.push({ path: '/user/pbx-configuration/call-queues' })
            context.commit('expandCallQueue', subscriber.id)
        }
    }
}
