import { i18n } from 'boot/i18n'
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
        callQueueListError: null,
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
            return state.callQueueRemovalState === RequestState.requesting
        },
        isCallQueueLoading (state) {
            return (callQueueId) => {
                return (state.callQueueRemovalState === RequestState.requesting &&
                    state.callQueueRemoving !== null && state.callQueueRemoving.id === callQueueId) ||
                    (state.callQueueUpdateState === RequestState.requesting &&
                    state.callQueueUpdating !== null && state.callQueueUpdating.id === callQueueId)
            }
        },
        isCallQueueExpanded (state) {
            return (callQueueId) => {
                return state.callQueueSelected !== null && state.callQueueSelected.id === callQueueId
            }
        },
        getCallQueueRemoveDialogMessage (state) {
            if (state.callQueueRemoving !== null) {
                return i18n.global.t('You are about to remove call queue for {subscriber}', {
                    subscriber: state.subscriberMap[state.callQueueRemoving.subscriber_id]?.display_name ?? ''
                })
            }
            return ''
        },
        getCallQueueRemovingName (state) {
            const subscriber = state.subscriberMap[state.callQueueRemoving?.subscriber_id]
            return subscriber?.display_name ?? ''
        },
        getCallQueueCreatingName (state) {
            const subscriber = state.subscriberMap[state.callQueueCreationData?.subscriberId]
            return subscriber?.display_name ?? ''
        },
        getCallQueueUpdatingName (state) {
            const subscriber = state.subscriberMap[state.callQueueUpdating?.subscriber_id]
            return subscriber?.display_name ?? ''
        },
        getCallQueueUpdatingField (state) {
            return state.callQueueUpdatingField
        },
        getCallQueueCreationToastMessage (state, getters) {
            return i18n.global.t('Created call queue for {callQueue} successfully', {
                callQueue: getters.getCallQueueCreatingName
            })
        },
        getCallQueueUpdateToastMessage (state, getters) {
            return i18n.global.t('Updated {field} for call queue {callQueue} successfully', {
                callQueue: getters.getCallQueueUpdatingName,
                field: getters.getCallQueueUpdatingField
            })
        },
        getCallQueueRemovalToastMessage (state, getters) {
            return i18n.global.t('Removed call queue for {callQueue} successfully', {
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
            state.callQueueList = callQueueList?.callQueues?.items ?? []
            state.callQueueMap = {}
            state.callQueueList.forEach((callQueue) => {
                state.callQueueMap[callQueue.id] = callQueue
            })
            state.subscriberMap = {}
            const subscribers = callQueueList?.subscribers?.items ?? []
            subscribers.forEach((subscriber) => {
                state.subscriberMap[subscriber.id] = subscriber
            })
            state.callQueueListVisible = true
        },
        callQueueListFailed (state, err) {
            state.callQueueListState = RequestState.failed
            state.callQueueListError = err
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
            if (!preferences) {
                return
            }
            const callQueueId = preferences.id
            const index = state.callQueueList.findIndex((callQueue) => callQueue.id === callQueueId)
            if (index !== -1) {
                state.callQueueList[index] = preferences
            }
            state.callQueueMap[callQueueId] = preferences
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
        expandCallQueueBySubscriberId (state, subscriberId) {
            state.callQueueSelected = state.callQueueList.find((callQueue) => {
                return callQueue.subscriber_id === subscriberId
            }) || null
        },
        collapseCallQueue (state) {
            state.callQueueSelected = null
        }
    },
    actions: {
        async loadCallQueueList (context, options) {
            const listVisible = options?.listVisible ?? false
            const selectedId = options?.selectedId ?? null
            const selectedSubscriberId = options?.selectedSubscriberId ?? null
            context.commit('callQueueListRequesting', { listVisible })
            try {
                const callQueueList = await getCallQueueList()
                context.commit('callQueueListSucceeded', callQueueList)

                if (selectedId !== null) {
                    context.commit('expandCallQueue', selectedId)
                } else if (selectedSubscriberId !== null) {
                    context.commit('expandCallQueueBySubscriberId', selectedSubscriberId)
                }
            } catch (err) {
                context.commit('callQueueListFailed', err.message)
            }
        },
        createCallQueue (context, callQueueData) {
            context.commit('callQueueCreationRequesting', callQueueData)
            createCallQueue(callQueueData).then(() => {
                return context.dispatch('loadCallQueueList', {
                    listVisible: true,
                    selectedSubscriberId: callQueueData.subscriberId
                })
            }).then(() => {
                context.commit('callQueueCreationSucceeded')
            }).catch((err) => {
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
                context.commit('callQueueUpdateFailed', err.message)
            })
        },
        jumpToCallQueue (context, subscriber) {
            this.$router?.push({ path: '/user/pbx-configuration/call-queues' })
            context.commit('expandCallQueueBySubscriberId', subscriber.id)
        }
    }
}
