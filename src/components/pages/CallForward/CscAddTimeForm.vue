<template>
    <div class="times-card">
        <q-card-title class="times-title">
            {{ title }}
        </q-card-title>
        <q-card-main>
            <div class="row no-wrap">
                <q-field class="col-8">
                    <q-select v-model="selectedWeekday"
                        :options="selectOptions" />
                </q-field>
                <q-field class="col-2"
                    :error="timeHasError"
                    :error-label="$t('pages.callForward.times.selectValidTime')">
                        <q-datetime
                            color="primary"
                            v-model="timeFromConverted"
                            align="right"
                            type="time"
                            format24h />
                </q-field>
                <q-field class="col-2"
                    :error="timeHasError"
                    :error-label="$t('pages.callForward.times.selectValidTime')">
                        <q-datetime
                            color="primary"
                            v-model="timeToConverted"
                            align="right"
                            type="time"
                            format24h />
                </q-field>
            </div>
            <q-btn flat dark @click="disableForm()">{{ $t('buttons.cancel') }}</q-btn>
            <q-btn flat color="primary" icon-right="fa-save" @click="createTimesetWithTime()">{{ $t('buttons.save') }}</q-btn>
        </q-card-main>
    </div>
</template>

<script>
    // TODO: Complete implementation of csc-add-time-form, by also moving over
    // methods, "toggle visible" state and props
    import { mapState } from 'vuex'
    import { QField, QSelect, QDatetime, QCardTitle,
        QCardMain, QBtn, date } from 'quasar-framework'
    export default {
        name: 'csc-add-time-form',
        props: [
            'type',
            'title',
            'timeset'
        ],
        data () {
            return {
                selectOptions: [
                    { label: this.$t('pages.callForward.times.sunday'), value: 1 },
                    { label: this.$t('pages.callForward.times.monday'), value: 2 },
                    { label: this.$t('pages.callForward.times.tuesday'), value: 3 },
                    { label: this.$t('pages.callForward.times.wednesday'), value: 4 },
                    { label: this.$t('pages.callForward.times.thursday'), value: 5 },
                    { label: this.$t('pages.callForward.times.friday'), value: 6 },
                    { label: this.$t('pages.callForward.times.saturday'), value: 7 }
                ],
                selectedWeekday: 1,
                timeFrom: '0:00',
                timeTo: '0:00'
            }
        },
        components: {
            QField,
            QSelect,
            QDatetime,
            QCardTitle,
            QCardMain,
            QBtn,
            date
        },
        computed: {
            ...mapState('callForward', {
                addTimesetState: 'addTimesetState',
                addTimesetError(state) {
                    return state.addTimesetError ||
                        this.$t('pages.callForward.times.addTimesetErrorMessage');
                },
                activeTimeForm: 'activeTimeForm'
            }),
            timeFromConverted: {
                get() {
                    return date.buildDate({
                        hours: this.timeFrom.split(':')[0],
                        minutes: this.timeFrom.split(':')[1]
                    });
                },
                set(value) {
                    this.timeFrom = date.formatDate(value, 'HH:mm');
                }
            },
            timeToConverted: {
                get() {
                    return date.buildDate({
                        hours: this.timeTo.split(':')[0],
                        minutes: this.timeTo.split(':')[1]
                    });
                },
                set(value) {
                    this.timeTo = date.formatDate(value, 'HH:mm');
                }
            },
            timeHasError() {
                let timeToHour = parseInt(this.timeTo.split(':')[0]);
                let timeFromHour = parseInt(this.timeFrom.split(':')[0]);
                let timeToMinute = parseInt(this.timeTo.split(':')[1]);
                let timeFromMinute = parseInt(this.timeFrom.split(':')[1]);
                let hoursReverse = timeToHour < timeFromHour || timeToMinute < timeFromMinute;
                let sameTime = this.timeTo === this.timeFrom;
                return hoursReverse || sameTime;
            }
        },
        watch: {
        },
        methods: {
        }
    }
</script>

<style lang="stylus">
@import '~variables'
    .times-card
        padding 0 15px
    .q-field
        margin 5px 0
    .q-card-main
        padding-bottom 8px
</style>
