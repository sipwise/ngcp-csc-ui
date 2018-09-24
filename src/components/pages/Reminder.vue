<template>
    <csc-page
        class="csc-simple-page"
    >
        <q-field
            class="reminder-field"
        >
            <q-toggle
                :disable="isReminderLoading"
                :label="toggleLabel"
                :value="isReminderActive"
                @input="toggleReminder()"
                checked-icon="notifications_active"
                unchecked-icon="notifications_off"
            />
        </q-field>
        <q-field
            class="reminder-field"
        >
            <q-datetime
                format24h
                type="time"
                :no-clear="true"
                :disable="isReminderLoading"
                :float-label="$t('pages.reminder.timeLabel')"
                :value="normalizedTime"
                @input="updateTime"
            />
        </q-field>
        <q-field
            class="reminder-field"
        >
            <q-option-group
                color="positive"
                type="radio"
                :disable="isReminderLoading"
                :options="recurrenceOptions"
                :value="reminderRecurrence"
                @input="updateRecurrence"
            />
        </q-field>
    </csc-page>
</template>

<script>

    import _ from 'lodash'
    import {
        mapGetters
    } from 'vuex'
    import CscPage from '../CscPage'
    import {
        QField,
        QToggle,
        QDatetime,
        QOptionGroup,
        Toast
    } from 'quasar-framework'
    import {
        showToast
    } from '../../helpers/ui'

    export default {
        data() {
            return {}
        },
        mounted() {
            this.$store.dispatch('reminder/loadReminder');
        },
        components: {
            CscPage,
            QToggle,
            Toast,
            QDatetime,
            QOptionGroup,
            QField
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
            recurrenceOptions() {
                return [
                    {
                        label: this.$t('pages.reminder.recurrence.once'),
                        value: 'never'
                    },
                    {
                        label: this.$t('pages.reminder.recurrence.weekdays'),
                        value: 'weekdays'
                    },
                    {
                        label: this.$t('pages.reminder.recurrence.always'),
                        value: 'always'
                    }
                ]
            },
            toggleLabel() {
                if(this.isReminderActive) {
                    return this.$t('pages.reminder.toggleEnabled');
                }
                else {
                    return this.$t('pages.reminder.toggleDisabled');
                }
            },
            normalizedTime() {
                let timeParts = this.reminderTime.split(':');
                let newDate = new Date();
                newDate.setHours(parseInt(_.get(timeParts, '0', 0)));
                newDate.setMinutes(parseInt(_.get(timeParts, '1', 0)));
                newDate.setSeconds(parseInt(_.get(timeParts, '2', 0)));
                return newDate;
            }
        },
        methods: {
            mapRecurrence(recurrence) {
                switch(recurrence) {
                    case 'never':
                        return this.$t('pages.reminder.recurrence.once');
                    case 'weekdays':
                        return this.$t('pages.reminder.recurrence.weekdays');
                    case 'always':
                        return this.$t('pages.reminder.recurrence.always');
                }
            },
            toggleReminder() {
                this.$store.dispatch('reminder/toggleReminder');
            },
            updateTime(time) {
                this.$store.dispatch('reminder/updateTime', time);
            },
            updateRecurrence(recurrence) {
                this.$store.dispatch('reminder/updateRecurrence', recurrence);
            }
        },
        watch: {
            reminderUpdated(updated) {
                if(updated && this.reminderUpdating === 'active' && this.isReminderActive) {
                    showToast(this.$t('pages.reminder.enabledToast'));
                }
                else if(updated && this.reminderUpdating === 'active') {
                    showToast(this.$t('pages.reminder.disabledToast'));
                }
                else if(updated && this.reminderUpdating === 'time') {
                    showToast(this.$t('pages.reminder.timeChangedToast', {
                        time: this.reminderTime
                    }));
                }
                else if(updated && this.reminderUpdating === 'recurrence') {
                    showToast(this.$t('pages.reminder.recurrenceChangedToast', {
                        recurrence: this.mapRecurrence(this.reminderRecurrence)
                    }));
                }
            }
        }
    }
</script>

<style lang="stylus" rel="stylesheet/stylus">

    .reminder-field
        margin-bottom 40px

</style>
