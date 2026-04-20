<template>
    <csc-cf-destination
        :model-value="destination"
        icon="person"
        :label="seatLabel"
        :clickable="true"
    >
        <q-popup-edit
            v-slot="scope"
            v-model="seatOption"
            anchor="top left"
            @before-show="store.commit('callForwarding/popupShow', null)"
            @save="emit('input', $event.value)"
        >
            <csc-cf-seat-select
                v-model="scope.value"
                :disable="attrs.loading"
            />
            <div class="row justify-end q-gutter-sm q-pt-sm">
                <q-btn
                    flat
                    :label="t('Cancel')"
                    @click="scope.cancel"
                />
                <q-btn
                    flat
                    color="primary"
                    :label="t('Set')"
                    :disable="!scope.value"
                    @click="scope.set"
                />
            </div>
        </q-popup-edit>
    </csc-cf-destination>
</template>

<script setup>
import CscCfDestination from 'components/call-forwarding/CscCfDestination'
import CscCfSeatSelect from 'components/call-forwarding/CscCfSeatSelect'
import { createSeatOption } from 'src/helpers/call-forwarding-destinations'
import {
    computed,
    useAttrs
} from 'vue'
import { useI18n } from 'vue-i18n'
import { useStore } from 'vuex'

defineOptions(
    { name: 'CscCfDestinationSeat' }
)

const props = defineProps({
    destination: {
        type: Object,
        default: undefined
    },
    seatItem: {
        type: Object,
        default: undefined
    }
})

const emit = defineEmits(['input'])

const attrs = useAttrs()
const { t } = useI18n()
const store = useStore()

const seatOption = computed(() => createSeatOption(props.seatItem) || { label: props.destination?.simple_destination, value: props.destination?.simple_destination })

const seatLabel = computed(() => seatOption.value?.label || t('Seat'))
</script>
