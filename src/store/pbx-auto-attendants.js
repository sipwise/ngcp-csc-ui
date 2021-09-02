import { getAutoAttendants, editSubscriberSlots } from '../api/pbx-auto-attendants'
import { getSubscribers } from '../api/subscriber'
import { displayName } from 'src/filters/subscriber'

export default {
    namespaced: true,
    state: {
        slots: [],
        newSlots: [],
        subscribers: [],
        slotsNumbers: ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9']
    },
    getters: {
        slots (state) {
            return state.slots
        },
        slotsNumbers (state) {
            return state.slotsNumbers
        },
        newSlots (state) {
            return state.newSlots
        },
        subscribers (state) {
            return state.subscribers.map(subscriber => {
                return {
                    label: displayName(subscriber),
                    value: subscriber.id
                }
            })
        }
    },
    mutations: {
        slots (state, data) {
            state.slots = data
        },
        newSlots (state, data) {
            for (const slot of data) {
                state.newSlots.push({
                    subscriber_id: slot.subscriber_id,
                    slots: []
                })
            }
        },
        subscriberSlots (state, data) {
            const subscriberSlots = state.slots.filter(slot => slot.subscriber_id === data.subscriberId)[0]
            subscriberSlots.slots = data.slots
        },
        createNewSlot (state, data) {
            const subscriberSlots = state.newSlots.filter(slot => slot.subscriber_id === data.subscriberId)[0]
            subscriberSlots.slots.push({
                slot: data.slot,
                destination: null
            })
        },
        editNewSlot (state, data) {
            const subscriberSlots = state.newSlots.filter(slot => slot.subscriber_id === data.subscriberId)[0]
            subscriberSlots.slots[data.index].destination = data.destination
        },
        deleteNewSlot (state, data) {
            const subscriberSlots = state.newSlots.filter(slot => slot.subscriber_id === data.subscriberId)[0]
            subscriberSlots.slots.splice(data.index, 1)
        },
        resetNewSlots (state, subscriberId) {
            const subscriberSlots = state.newSlots.filter(slot => slot.subscriber_id === subscriberId)[0]
            subscriberSlots.slots.splice(0, subscriberSlots.slots.length)
        },
        subscribers (state, subscribers) {
            state.subscribers = subscribers
        }
    },
    actions: {
        async fetchAutoAttendants (context, options) {
            const autoAttendants = await getAutoAttendants(options)
            context.commit('slots', autoAttendants._embedded['ngcp:autoattendants'])
            context.commit('newSlots', autoAttendants._embedded['ngcp:autoattendants'])
            return autoAttendants.total_count
        },
        async fetchSubscribers (context, subscriberName) {
            const subscribers = await getSubscribers({
                params: {
                    display_name: subscriberName || '*'
                }
            })
            context.commit('subscribers', subscribers.items)
        },
        async updateSubscriberSlots (context, options) {
            const slots = await editSubscriberSlots(options)
            context.commit('subscriberSlots', {
                subscriberId: options.subscriberId,
                slots: slots
            })
        },
        createNewSlot (context, options) {
            context.commit('createNewSlot', {
                subscriberId: options.subscriberId,
                slot: options.slot
            })
        },
        editNewSlot (context, options) {
            context.commit('editNewSlot', {
                subscriberId: options.subscriberId,
                index: options.index,
                destination: options.destination
            })
        },
        deleteNewSlot (context, options) {
            context.commit('deleteNewSlot', {
                subscriberId: options.subscriberId,
                index: options.index
            })
        },
        resetAllNewSlots (context, subscriberId) {
            context.commit('resetNewSlots', subscriberId)
        }
    }
}
