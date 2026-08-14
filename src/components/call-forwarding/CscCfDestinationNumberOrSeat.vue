<template>
    <q-spinner
        v-if="checking"
        size="1em"
        color="primary"
    />
    <csc-cf-destination-seat
        v-else-if="isSeatDestination"
        :destination="destination"
        :seat-item="seatItem"
        @input="$emit('input', $event)"
    />
    <csc-cf-destination-number
        v-else
        :value="value"
        :destination="destination"
        @input="$emit('input', $event)"
    />
</template>

<script setup>
import CscCfDestinationNumber from 'components/call-forwarding/CscCfDestinationNumber'
import CscCfDestinationSeat from 'components/call-forwarding/CscCfDestinationSeat'
import { useActions, useGetters } from 'src/composables/useStore'
import {
    onMounted,
    ref,
    watch
} from 'vue'

defineOptions({ name: 'CscCfDestinationNumberOrSeat' })

const props = defineProps({
    destination: {
        type: Object,
        default: undefined
    },
    value: {
        type: String,
        default: undefined
    }
})

defineEmits(['input'])

const checking = ref(true)
const isSeatDestination = ref(false)
const seatItem = ref(null)

const { seatByPrimaryNumber } = useGetters('callForwarding', ['seatByPrimaryNumber'])
const { loadSeats } = useActions('callForwarding', ['loadSeats'])

async function checkIfSeat (simpleDestination) {
    if (!simpleDestination) {
        checking.value = false
        return
    }

    try {
        const cachedSeat = seatByPrimaryNumber.value(simpleDestination)
        if (cachedSeat) {
            isSeatDestination.value = true
            seatItem.value = cachedSeat
            return
        }

        const response = await loadSeats({
            page: 1,
            rows: 1,
            primary_number: simpleDestination
        })
        isSeatDestination.value = (response.totalCount ?? 0) > 0
        seatItem.value = response.items[0] ?? null
    } catch {
        isSeatDestination.value = false
        seatItem.value = null
    } finally {
        checking.value = false
    }
}

onMounted(() => {
    checkIfSeat(props.destination?.simple_destination)
})

watch(() => props.destination?.simple_destination, (newVal) => {
    checking.value = true
    isSeatDestination.value = false
    checkIfSeat(newVal)
})
</script>
