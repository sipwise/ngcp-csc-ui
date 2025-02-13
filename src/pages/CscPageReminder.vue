<template>
    <csc-page
        id="csc-page-reminder"
        class="q-pa-lg row"
    >
        <q-list
            class="col col-xs-12 col-md-4"
        >
            <q-item>
                <q-item-section>
                    <q-toggle
                        :disable="isReminderLoading"
                        :label="toggleLabel"
                        :model-value="isReminderActive"
                        data-cy="csc-reminder-toggle"
                        checked-icon="notifications_active"
                        unchecked-icon="notifications_off"
                        @update:model-value="toggleReminder"
                    />
                </q-item-section>
                <q-item-section
                    side
                >
                    <csc-spinner
                        v-if="isReminderLoading"
                        class="self-center"
                    />
                </q-item-section>
            </q-item>
            <q-item>
                <q-item-section>
                    <div
                        class="q-gutter-sm"
                    >
                        <q-radio
                            v-for="(recurrenceOption, index) in recurrenceOptions"
                            :key="index"
                            :model-value="reminderRecurrence"
                            :val="recurrenceOption.value"
                            :label="recurrenceOption.label"
                            data-cy="csc-reminder-occurance"
                            @update:model-value="updateRecurrence"
                        />
                    </div>
                </q-item-section>
            </q-item>
            <q-item>
                <q-item-section>
                    <q-input
                        v-model="reminderTime"
                        :loading="isReminderLoading"
                        data-cy="csc-reminder-time"
                        fill-mask="_"
                        mask="##:##"
                        dense
                    >
                        <template
                            #loading
                        >
                            <q-spinner-dots
                                color="primary"
                            />
                        </template>
                        <template
                            #prepend
                        >
                            <q-btn
                                icon="access_alarm"
                                color="primary"
                                data-cy="csc-reminder-show-timeselector"
                                flat
                                dense
                            >
                                <q-popup-proxy
                                    ref="timePopup"
                                >
                                    <q-time
                                        v-model="reminderTime"
                                        format24h
                                        now-btn
                                        flat
                                        mask="HH:mm"
                                        color="primary"
                                        data-cy="csc-reminder-timeselector"
                                        @update:model-value="timeUpdate"
                                    >
                                        <q-btn
                                            v-close-popup
                                            :label="$t('Close')"
                                            data-cy="csc-reminder-timeseletor-close"
                                            color="primary"
                                            flat
                                        />
                                    </q-time>
                                </q-popup-proxy>
                            </q-btn>
                        </template>
                    </q-input>
                </q-item-section>
            </q-item>
        </q-list>
    </csc-page>
</template>

<script>
import CscPage from 'components/CscPage'
import CscSpinner from 'components/CscSpinner'
import { date } from 'quasar'
import { showGlobalError, showToast } from 'src/helpers/ui'
import { RequestState } from 'src/store/common'
import {
    mapActions,
    mapGetters,
    mapState
} from 'vuex'

export default {
    name: 'CscPageReminder',
    components: {
        CscSpinner,
        CscPage
    },
    data () {
        return {
        }
    },
    computed: {
        ...mapGetters('reminder', [
            'isReminderActive',
            'reminderTime',
            'reminderRecurrence',
            'reminderLoadingState',
            'reminderUpdating',
            'reminderError',
            'isReminderLoading',
            'reminderUpdated'
        ]),
        ...mapState('reminder', [
            'reminderLoadingState'
        ]),
        recurrenceOptions () {
            return [
                {
                    label: this.$t('Only once'),
                    value: 'never',
                    icon: 'looks_one'
                },
                {
                    label: this.$t('On weekdays'),
                    value: 'weekdays'
                },
                {
                    label: this.$t('Always'),
                    value: 'always'
                }
            ]
        },
        toggleLabel () {
            if (this.isReminderActive) {
                return this.$t('Reminder is enabled')
            }
            return this.$t('Reminder is disabled')
        }
    },
    watch: {
        reminderUpdated (updated) {
            if (updated && this.reminderUpdating === 'active' && this.isReminderActive) {
                showToast(this.$t('Reminder: Enabled successfully'))
            } else if (updated && this.reminderUpdating === 'active') {
                showToast(this.$t('Reminder: Disabled successfully'))
            } else if (updated && this.reminderUpdating === 'time') {
                showToast(this.$t('Reminder: Time changed to {time}', {
                    time: this.reminderTime
                }))
            } else if (updated && this.reminderUpdating === 'recurrence') {
                showToast(this.$t('Reminder: Recurrence changed to "{recurrence}"', {
                    recurrence: this.mapRecurrence(this.reminderRecurrence)
                }))
            }
        },
        reminderLoadingState () {
            if (this.reminderLoadingState === RequestState.failed) {
                showGlobalError(this.reminderError)
            }
        }
    },
    mounted () {
        this.loadReminder()
    },
    methods: {
        ...mapActions('reminder', [
            'loadReminder',
            'toggleReminder',
            'updateTime',
            'updateRecurrence'
        ]),
        timeUpdate (time) {
            this.updateTime(time)
        },
        mapRecurrence (recurrence) {
            switch (recurrence) {
            case 'never':
                return this.$t('Only once')
            case 'weekdays':
                return this.$t('On weekdays')
            case 'always':
                return this.$t('Always')
            }
        },
        dateFormat (dateTime, format) {
            return date.formatDate(dateTime, format)
        }
    }
}
</script>
