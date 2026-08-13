<template>
    <csc-cf-destination
        :model-value="destination"
        :label="destination.simple_destination === ' ' ? $t('Number') : destination.simple_destination"
        :clickable="true"
    >
        <q-popup-edit
            v-slot="scope"
            v-model="number"
            :validate="isValidNumber"
            @before-show="setPopupShow(null)"
            @save="$emit('input', $event)"
        >
            <csc-input
                v-model="scope.value"
                color="primary"
                dense
                maxlength="64"
            >
                <template
                    #prepend
                >
                    <q-icon
                        name="phone_forwarded"
                    />
                </template>
            </csc-input>
            <div class="row justify-end q-gutter-sm q-pt-sm">
                <q-btn
                    flat
                    :label="$t('Cancel')"
                    @click="scope.cancel"
                />
                <q-btn
                    flat
                    color="primary"
                    :label="$t('Set')"
                    :disable="!isValidNumber(scope.value)"
                    @click="scope.set"
                />
            </div>
        </q-popup-edit>
    </csc-cf-destination>
</template>

<script>
import CscCfDestination from 'components/call-forwarding/CscCfDestination'
import CscInput from 'components/form/CscInput'
import { userInfo } from 'src/helpers/validation'
import { mapActions } from 'vuex'
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
    methods: {
        ...mapActions('callForwarding', ['setPopupShow']),
        isValidNumber (value) {
            return userInfo(value?.trim())
        }
    },
    watch: {
        '$attrs.value' (value) {
            this.number = value
        }
    }
}
</script>
