<template>
    <csc-cf-destination
        :model-value="destination"
        :label="destination.simple_destination === ' ' ? $t('Number') : destination.simple_destination"
        :clickable="true"
    >
        <q-popup-edit
            v-slot="scope"
            v-model="number"
            buttons
            @before-show="$store.commit('callForwarding/popupShow', null)"
            @save="$emit('input', $event)"
        >
            <csc-input
                v-model="scope.value"
                dense
            >
                <template
                    #prepend
                >
                    <q-icon
                        name="phone_forwarded"
                    />
                </template>
            </csc-input>
        </q-popup-edit>
    </csc-cf-destination>
</template>

<script>
import CscCfDestination from 'components/call-forwarding/CscCfDestination'
import CscInput from 'components/form/CscInput'
export default {
    name: 'CscCfDestinationNumber',
    components: { CscInput, CscCfDestination },
    props: {
        destination: {
            type: Object,
            default: undefined
        }
    },
    emits: ['input'],
    data () {
        return {
            number: this.$attrs.value
        }
    },
    watch: {
        '$attrs.value' (value) {
            this.number = value
        }
    }
}
</script>
