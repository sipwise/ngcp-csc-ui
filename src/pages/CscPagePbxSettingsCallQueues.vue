<template>
    <csc-page
        id="csc-page-voicebox"
        class="row q-pa-lg"
    >
        <q-list
            class="col col-xs-12 col-md-6"
        >
            <q-toggle
                v-model="cloud_pbx_callqueue"
                :label="$t('Call Queue feature')"
                :disable="isLoading"
                @input="addOrRemoveCallQueue()"
            />
            <csc-spinner
                v-if="isLoading || !callQueue || !changes"
                class="q-ml-xl"
            />
            <div v-if="changes && callQueue">
                <q-item>
                    <q-item-section>
                        <csc-input-saveable
                            v-model="changes.max_queue_length"
                            :label="$t('Queue Length')"
                            :value-changed="hasMaxQueueLengthChanged"
                            :error="$v.changes.max_queue_length.$error"
                            :error-message="queueMaxLengthErrorMessage"
                            :disable="isLoading || !cloud_pbx_callqueue"
                            @undo="resetMaxQueueLength"
                            @save="save"
                            @input="$v.changes.max_queue_length.$touch"
                            @keypress.space.prevent
                            @keydown.space.prevent
                            @keyup.space.prevent
                        />
                    </q-item-section>
                </q-item>
                <q-item>
                    <q-item-section>
                        <csc-input-saveable
                            v-model="changes.queue_wrap_up_time"
                            :label="$t('Wrap up time')"
                            :value-changed="hasQueueWrapUpTimeChanged"
                            :error="$v.changes.queue_wrap_up_time.$error"
                            :error-message="queueWrapUpTimeErrorMessage"
                            :disable="isLoading || !cloud_pbx_callqueue"
                            @undo="resetQueueWrapUpTime"
                            @save="save"
                            @input="$v.changes.queue_wrap_up_time.$touch"
                            @keypress.space.prevent
                            @keydown.space.prevent
                            @keyup.space.prevent
                        />
                    </q-item-section>
                </q-item>
            </div>
        </q-list>
    </csc-page>
</template>

<script>
import {
    mapGetters,
    mapState
} from 'vuex'
import { mapWaitingActions } from 'vue-wait'
import CscPage from 'components/CscPage'
import CscInputSaveable from 'components/form/CscInputSaveable'
import CscSpinner from 'components/CscSpinner'
import {
    maxValue,
    minValue,
    numeric
} from 'vuelidate/lib/validators'
import { getSubscriberId } from 'src/auth'
import {
    showToast
} from 'src/helpers/ui'
export default {
    name: 'CscPagePbxSettingsCallQueues',
    components: {
        CscPage,
        CscInputSaveable,
        CscSpinner
    },
    data () {
        return {
            callQueue: null,
            changes: null,
            cloud_pbx_callqueue: false
        }
    },
    validations: {
        changes: {
            max_queue_length: {
                numeric,
                minValue: minValue(1),
                maxValue: maxValue(99999)
            },
            queue_wrap_up_time: {
                numeric,
                minValue: minValue(1),
                maxValue: maxValue(99999)
            }
        }
    },
    computed: {
        ...mapState('pbxCallQueues', [
            'defaultMaxQueueLength',
            'defaultQueueWrapUpTime'
        ]),
        ...mapState('callSettings', [
            'subscriberPreferences'
        ]),
        ...mapGetters('user', [
            'getUsername'
        ]),
        hasMaxQueueLengthChanged () {
            return this.callQueue.max_queue_length !== this.changes.max_queue_length
        },
        hasQueueWrapUpTimeChanged () {
            return this.callQueue.queue_wrap_up_time !== this.changes.queue_wrap_up_time
        },
        queueMaxLengthErrorMessage () {
            if (!this.$v.changes.max_queue_length.numeric) {
                return this.$t('{field} must consist of numeric characters only', {
                    field: this.$t('Queue Length')
                })
            } else if (!this.$v.changes.max_queue_length.minValue) {
                return this.$t('{field} must be at least {minValue} second', {
                    field: this.$t('Queue Length'),
                    minValue: this.$v.changes.max_queue_length.$params.minValue.min
                })
            } else if (!this.$v.changes.max_queue_length.maxValue) {
                return this.$t('{field} must be maximum of {maxValue} seconds', {
                    field: this.$t('Queue Length'),
                    maxValue: this.$v.changes.max_queue_length.$params.maxValue.max
                })
            } else {
                return ''
            }
        },
        queueWrapUpTimeErrorMessage () {
            if (!this.$v.changes.queue_wrap_up_time.numeric) {
                return this.$t('{field} must consist of numeric characters only', {
                    field: this.$t('Wrap Up Time')
                })
            } else if (!this.$v.changes.queue_wrap_up_time.minValue) {
                return this.$t('{field} must be at least {minValue} second', {
                    field: this.$t('Wrap Up Time'),
                    minValue: this.$v.changes.queue_wrap_up_time.$params.minValue.min
                })
            } else if (!this.$v.changes.queue_wrap_up_time.maxValue) {
                return this.$t('{field} must be maximum of {maxValue} seconds', {
                    field: this.$t('Wrap Up Time'),
                    maxValue: this.$v.changes.queue_wrap_up_time.$params.maxValue.max
                })
            } else {
                return ''
            }
        },
        isLoading () {
            return this.$wait.is('csc-pbx-call-settings-load-preferences') ||
                this.$wait.is('csc-pbx-call-settings-update-preferences')
        }
    },
    async mounted () {
        await this.loadSubscriberPreferencesAction()
        this.getCallQueue()
        this.changes = this.getDefaultData()
    },
    methods: {
        ...mapWaitingActions('callSettings', {
            loadSubscriberPreferencesAction: 'csc-pbx-call-settings-load-preferences',
            fieldUpdateAction: 'csc-pbx-call-settings-update-preferences'
        }),
        resetMaxQueueLength () {
            this.changes.max_queue_length = this.getDefaultData().max_queue_length
        },
        resetQueueWrapUpTime () {
            this.changes.queue_wrap_up_time = this.getDefaultData().queue_wrap_up_time
        },
        getDefaultData () {
            return {
                max_queue_length: this.callQueue.max_queue_length.toString() || this.defaultMaxQueueLength.toString(),
                queue_wrap_up_time: this.callQueue.queue_wrap_up_time.toString() || this.defaultQueueWrapUpTime.toString()
            }
        },
        async save () {
            if (this.hasMaxQueueLengthChanged && !this.$v.changes.max_queue_length.$error) {
                await this.fieldUpdateAction({ field: 'max_queue_length', value: this.changes.max_queue_length || this.defaultMaxQueueLength })
                showToast(this.$t('Updated {field} for call queue {callQueue} successfully', {
                    callQueue: this.getUsername,
                    field: this.$t('Queue Length')
                }))
            }
            if (this.hasQueueWrapUpTimeChanged && !this.$v.changes.queue_wrap_up_time.$error) {
                await this.fieldUpdateAction({ field: 'queue_wrap_up_time', value: this.changes.queue_wrap_up_time || this.defaultQueueWrapUpTime })
                showToast(this.$t('Updated {field} for call queue {callQueue} successfully', {
                    callQueue: this.getUsername,
                    field: this.$t('Wrap up time')
                }))
            }
            this.getCallQueue()
            this.changes = this.getDefaultData()
        },
        getCallQueue () {
            this.callQueue = {
                id: this.subscriberPreferences.id,
                max_queue_length: this.subscriberPreferences.max_queue_length || this.defaultMaxQueueLength.toString(),
                queue_wrap_up_time: this.subscriberPreferences.queue_wrap_up_time || this.defaultQueueWrapUpTime.toString(),
                subscriber_id: getSubscriberId()
            }
            this.cloud_pbx_callqueue = this.subscriberPreferences.cloud_pbx_callqueue ? this.subscriberPreferences.cloud_pbx_callqueue : this.cloud_pbx_callqueue
        },
        addOrRemoveCallQueue () {
            this.fieldUpdateAction({ field: 'cloud_pbx_callqueue', value: this.cloud_pbx_callqueue })
        }
    }
}
</script>
