<template>
    <csc-select-paginated
        :model-value="modelValue"
        :label="label || t('Seats')"
        :fetch-fn="fetchSeats"
        clearable
        option-value="value"
        option-label="label"
        @update:model-value="selectSeat"
    >
        <template #prepend>
            <q-icon name="person" />
        </template>
    </csc-select-paginated>
</template>

<script setup>
import CscSelectPaginated from 'src/components/form/CscSelectPaginated'
import { mapSeatOptions } from 'src/helpers/call-forwarding-destinations'
import { useI18n } from 'vue-i18n'
import { useStore } from 'vuex'

defineOptions({ name: 'CscCfSeatSelect' })

defineProps({
    modelValue: {
        type: Object,
        default: null
    },
    label: {
        type: String,
        default: undefined
    }
})

const emit = defineEmits(['update:modelValue'])

const { t } = useI18n()
const store = useStore()

async function fetchSeats ({ page, rows, search }) {
    const response = await store.dispatch('callForwarding/loadSeats', {
        page,
        rows,
        display_name: search ? `*${search}*` : undefined,
        order_by: 'id',
        order_by_direction: 'asc'
    })

    return {
        items: mapSeatOptions(response.items),
        totalCount: response.totalCount
    }
}

function selectSeat (seatOption) {
    emit('update:modelValue', seatOption?.disable ? null : (seatOption ?? null))
}
</script>
