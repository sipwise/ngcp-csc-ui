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
                        :model-value="reminderTime"
                        :loading="isReminderLoading"
                        data-cy="csc-reminder-time"
                        fill-mask="_"
                        mask="##:##"
                        dense
                        @focus="$refs.timePopup.show()"
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
                                flat
                                dense
                            >
                                <q-popup-proxy
                                    ref="timePopup"
                                >
                                    <q-time
                                        :model-value="reminderTime"
                                        format24h
                                        now-btn
                                        flat
                                        mask="HH:mm"
                                        color="primary"
                                        @update:model-value="timeUpdate"
                                    />
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
import {
    mapGetters,
    mapActions
} from 'vuex'
import CscPage from 'components/CscPage'
import {
    showToast
} from 'src/helpers/ui'
import {
    date
} from 'quasar'
import CscSpinner from 'components/CscSpinner'

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
            } else {
                return this.$t('Reminder is disabled')
            }
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
            this.$refs.timePopup.hide()
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
