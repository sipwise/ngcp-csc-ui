<template>
<page :title="$t('reminder.title')">
    <q-field class="reminder-field">
        <q-toggle :label="$t('reminder.title') + (active ? ' enabled':' disabled')" @input="toggleReminder()" v-model="active" />
    </q-field>
    <q-field class="reminder-field">
        <q-datetime type="time" :disable="!active" no-clear=true v-model="timeConverted" :placeholder="$t('reminder.timeLabel')" @change="changeTime()" />
    </q-field>
    <q-field class="reminder-field">
        <q-option-group :disable="!active" color="positive" type="radio" v-model="recurrence" @change="changeRecurrence()" :options="[
      { label: $t('reminder.recurrence.once'), value: 'never' },
      { label: $t('reminder.recurrence.weekdays'), value: 'weekdays' },
      { label: $t('reminder.recurrence.always'), value: 'always' }
    ]" />
    </q-field>
</page>
</template>

<script>
import {
    startLoading,
    stopLoading,
    showGlobalError
} from '../../../helpers/ui'
import Page from '../../Page'
import {
    QField,
    QToggle,
    QDatetime,
    QOptionGroup,
    date,
    Toast
} from 'quasar-framework'
export default {
    data() {
        return {
            active: false,
            time: undefined,
            recurrence: 'never'
        }
    },
    mounted() {
        this.$store.dispatch('reminder/loadReminder').then(() => {
            this.active = this.$store.state.reminder.active;
            this.time = this.$store.state.reminder.time;
            this.recurrence = this.$store.state.reminder.recurrence;
        }).catch((err) => {
            console.log(err);
        });
    },
    components: {
        Page,
        QToggle,
        Toast,
        QDatetime,
        QOptionGroup,
        QField
    },
    computed: {
        timeConverted: {
            get: function() {
                var computedTime;
                if (this.time) {
                    computedTime = date.buildDate({
                        hours: this.time.split(':')[0],
                        minutes: this.time.split(':')[1],
                        seconds: '00'
                    });
                } else {
                    computedTime = date.buildDate({
                        hours: '00',
                        minutes: '00',
                        seconds: '00'
                    });
                }
                return computedTime;
            },
            set: function(newValue) {
                this.time = date.formatDate(newValue, 'HH:mm:ss');
            }
        }
    },
    methods: {
        toggleReminder() {
            this.$store.dispatch('reminder/toggleReminder', this.active).then(() => {
                Toast.create({
                    html: 'Reminder ' + ((this.active) ? 'enabled' : 'disabled'),
                    color: 'white',
                    bgColor: '#68A44E'
                });
            }).catch((err) => {
                console.log(err);
            });
        },
        changeTime() {
            this.$store.dispatch('reminder/changeTime', this.time).then(() => {
                Toast.create({
                    html: 'Time updated!',
                    color: 'white',
                    bgColor: '#68A44E'
                });
            }).catch((err) => {
                console.log(err);
            });
        },
        changeRecurrence() {
            this.$store.dispatch('reminder/changeRecurrence', this.recurrence).then(() => {
                Toast.create({
                    html: 'Recurrence updated!',
                    color: 'white',
                    bgColor: '#68A44E'
                });
            }).catch((err) => {
                console.log(err);
            });
        }
    }
}
</script>

<style>
.reminder-field {
    margin-bottom: 40px;
}
</style>
