<template>
    <div>
        <div class="row">
            <div
                class="col-xs-12 col-md-6"
            >
                <csc-input-saveable
                    v-model="data.destination"
                    icon="email"
                    :label="$t('Destination Email')"
                    data-cy="destination-email"
                    :disable="disabled"
                    :readonly="loading"
                    :error="v$.data.destination.$errors.length > 0"
                    :error-message="destinationErrorMessage"
                    :value-changed="!isAddNewMode && data.destination !== initialData.destination"
                    @update:model-value="v$.data.destination.$touch()"
                    @keypress.space.prevent
                    @keydown.space.prevent
                    @keyup.space.prevent
                    @undo="data.destination = initialData.destination"
                    @save="updatePropertyData('destination')"
                />
                <q-select
                    v-model="data.filetype"
                    dense
                    emit-value
                    map-options
                    :disable="loading"
                    :readonly="loading"
                    :label="$t('File Type')"
                    data-cy="destinaton-filetype"
                    :options="fileTypeOptions"
                    @update:model-value="updatePropertyData('filetype')"
                />
            </div>
            <div
                class="col-xs-12 col-md-6"
            >
                <q-toggle
                    v-model="data.incoming"
                    :label="$t('Deliver Incoming Faxes')"
                    data-cy="destinaton-deliver-incoming"
                    :disable="loading"
                    @update:model-value="updatePropertyData('incoming')"
                />
                <q-toggle
                    v-model="data.outgoing"
                    :label="$t('Deliver Outgoing Faxes')"
                    data-cy="destinaton-deliver-outgoing"
                    :disable="loading"
                    @update:model-value="updatePropertyData('outgoing')"
                />
                <q-toggle
                    v-model="data.status"
                    :label="$t('Receive Reports')"
                    data-cy="destinaton-receive-reports"
                    :disable="loading"
                    @update:model-value="updatePropertyData('status')"
                />
            </div>
        </div>
        <div
            v-if="isAddNewMode"
            class="row justify-center"
        >
            <q-btn
                flat
                color="default"
                icon="clear"
                :disable="loading"
                :label="$t('Cancel')"
                data-cy="destinaton-cancel-creation"
                @click="cancel()"
            />
            <q-btn
                flat
                color="primary"
                icon="done"
                :loading="loading"
                :disable="v$.data.$invalid || loading"
                :label="$t('Create destination')"
                data-cy="destinaton-creation-confirm"
                @click="save()"
            />
        </div>
    </div>
</template>

<script>
import { email, required } from '@vuelidate/validators'
import CscInputSaveable from 'components/form/CscInputSaveable'
import useValidate from '@vuelidate/core'
export default {
    name: 'CscFaxToMailDestinationForm',
    components: {
        CscInputSaveable
    },
    props: {
        loading: {
            type: Boolean,
            default: false
        },
        disabled: {
            type: Boolean,
            default: false
        },
        initialData: {
            type: Object,
            default: () => ({
                destination: '',
                filetype: 'TIFF',
                incoming: true,
                outgoing: true,
                status: true
            })
        },
        isAddNewMode: {
            type: Boolean,
            default: false
        }
    },
    emits: ['save', 'cancel', 'update-property'],
    data () {
        return {
            data: this.getDefaults(),
            v$: useValidate()
        }
    },
    validations: {
        data: {
            destination: {
                required,
                email
            }
        }
    },
    computed: {
        destinationErrorMessage () {
            const errorsTab = this.v$.data.destination.$errors
            if (errorsTab && errorsTab.length > 0 && errorsTab[0].$validator === 'required') {
                return this.$t('{field} is required', {
                    field: this.$t('Destination Email')
                })
            } else if (errorsTab && errorsTab.length > 0 && errorsTab[0].$validator === 'email') {
                return this.$t('Input a valid email address')
            } else {
                return ''
            }
        },
        fileTypeOptions () {
            return ['TIFF', 'PS', 'PDF', 'PDF14']
        }
    },
    methods: {
        getDefaults () {
            return { ...this.initialData }
        },
        cancel () {
            this.$emit('cancel')
        },
        save () {
            this.$emit('save', {
                ...this.data
            })
        },
        reset () {
            this.data = this.getDefaults()
            this.v$.$reset()
        },
        updatePropertyData (propertyName) {
            this.$emit('update-property', {
                name: propertyName,
                value: this.data[propertyName]
            })
        }
    }
}
</script>
