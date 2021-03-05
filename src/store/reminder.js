
import _ from 'lodash'
import { RequestState } from './common'
import {
    getReminder,
    setReminderActive,
    setReminderTime,
    setReminderRecurrence
} from '../api/reminder'

export default {
    namespaced: true,
    state: {
        reminder: null,
        reminderLoadingState: RequestState.initiated,
        reminderUpdating: null,
        reminderUpdated: false,
        reminderError: null
    },
    getters: {
        subscriberId (state, getters, rootState, rootGetters) {
            return rootGetters['user/getSubscriberId']
        },
        isReminderActive (state) {
            return state.reminder !== null && state.reminder.active === true
        },
        reminderTime (state) {
            return _.get(state.reminder, 'time', '00:00:00')
        },
        reminderRecurrence (state) {
            return _.get(state.reminder, 'recur', null)
        },
        reminderLoadingState (state) {
            return state.reminderLoadingState
        },
        reminderUpdating (state) {
            return state.reminderUpdating
        },
        reminderError (state) {
            return state.reminderError
        },
        reminderId (state) {
            return _.get(state.reminder, 'id', null)
        },
        isReminderLoading (state) {
            return state.reminderLoadingState === RequestState.requesting
        },
        reminderUpdated (state) {
            return state.reminderUpdated
        }
    },
    mutations: {
        reminderLoading (state) {
            state.reminderLoadingState = RequestState.requesting
            state.reminderError = null
        },
        reminderLoaded (state, reminder) {
            state.reminderLoadingState = RequestState.succeeded
            state.reminder = reminder
        },
        reminderLoadingFailed (state, error) {
            state.reminderLoadingState = RequestState.failed
            state.reminderError = error
        },
        reminderUpdating (state, field) {
            state.reminderLoadingState = RequestState.requesting
            state.reminderUpdating = field
            state.reminderUpdated = false
        },
        reminderUpdated (state) {
            state.reminderError = null
            state.reminderUpdated = true
        },
        reminderUpdatingFailed (state, error) {
            state.reminderLoadingState = RequestState.failed
            state.reminderError = error
        }
    },
    actions: {
        loadReminder (context) {
            return new Promise((resolve, reject) => {
                context.commit('reminderLoading')
                getReminder(context.getters.subscriberId).then((reminder) => {
                    context.commit('reminderLoaded', reminder)
                    resolve()
                }).catch((err) => {
                    reject(err)
                    context.commit('reminderLoadingFailed', err.message)
                })
            })
        },
        toggleReminder (context) {
            context.commit('reminderUpdating', 'active')
            if (context.getters.reminderId !== null) {
                setReminderActive(context.getters.reminderId, !context.getters.isReminderActive).then(() => {
                    return context.dispatch('loadReminder')
                }).then(() => {
                    context.commit('reminderUpdated')
                }).catch((err) => {
                    context.commit('reminderUpdatingFailed', err.message)
                })
            }
        },
        updateTime (context, time) {
            context.commit('reminderUpdating', time)
            if (context.getters.reminderId !== null) {
                setReminderTime(context.getters.reminderId, time).then(() => {
                    return context.dispatch('loadReminder')
                }).then(() => {
                    context.commit('reminderUpdated')
                }).catch((err) => {
                    context.commit('reminderUpdatingFailed', err.message)
                })
            }
        },
        updateRecurrence (context, recurrence) {
            context.commit('reminderUpdating', 'recurrence')
            if (context.getters.reminderId !== null) {
                setReminderRecurrence(context.getters.reminderId, recurrence).then(() => {
                    return context.dispatch('loadReminder')
                }).then(() => {
                    context.commit('reminderUpdated')
                }).catch((err) => {
                    context.commit('reminderUpdatingFailed', err.message)
                })
            }
        }
    }
}
