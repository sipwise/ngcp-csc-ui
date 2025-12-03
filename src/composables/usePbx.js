import { useStore } from 'src/composables/useStore'
import { computed } from 'vue'

export function usePbx () {
    const store = useStore()

    // State
    const numbers = computed(() => store.getters['pbx/numbers'])
    const seatList = computed(() => store.state.pbx.seatList)
    const groupList = computed(() => store.state.pbx.groupList)
    const deviceProfileList = computed(() => store.state.pbx.deviceProfileList)

    // Getters
    const numberOptions = computed(() => store.getters['pbx/getNumberOptions'])
    const seatOptions = computed(() => store.getters['pbx/getSeatOptions'])
    const groupOptions = computed(() => store.getters['pbx/getGroupOptions'])
    const subscriberOptions = computed(() => store.getters['pbx/getSubscriberOptions'])

    // Loading states
    const isNumbersRequesting = computed(() => store.getters['pbx/isNumbersRequesting'])
    const isSubscribersRequesting = computed(() => store.getters['pbx/isSubscribersRequesting'])

    // Actions
    const loadNumbers = () => store.dispatch('pbx/loadNumbers')
    const loadSubscribers = () => store.dispatch('pbx/loadSubscribers')
    const loadProfiles = () => store.dispatch('pbx/loadProfiles')
    const loadDeviceModel = (payload) => store.dispatch('pbx/loadDeviceModel', payload)

    return {
        // State
        numbers,
        seatList,
        groupList,
        deviceProfileList,

        // Getters
        numberOptions,
        seatOptions,
        groupOptions,
        subscriberOptions,

        // Loading states
        isNumbersRequesting,
        isSubscribersRequesting,

        // Actions
        loadNumbers,
        loadSubscribers,
        loadProfiles,
        loadDeviceModel
    }
}
