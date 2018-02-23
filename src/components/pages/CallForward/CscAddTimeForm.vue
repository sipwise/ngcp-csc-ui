<template>
    <div v-if="activeTimeForm" class="add-times">
        <q-card-title v-if="type === 'new'" class="times-title">
            {{ title }}
        </q-card-title>
        <q-card-main>
            <div class="row no-wrap">
                <q-field class="col-8">
                    <q-select v-model="selectedWeekday"
                        :options="selectOptions" />
                </q-field>
                <q-field class="col-2"
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
            <q-btn flat color="primary" icon-right="fa-save" @click="addTime()">{{ $t('buttons.save') }}</q-btn>
        </q-card-main>
    </div>
</template>

<script>
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
                selectedWeekday: 1
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
                activeTimeForm: 'activeTimeForm'
            }),
            timeFrom: {
                get() {
                    return this.$store.state.callForward.addTimeForm.timeFrom;
                },
                set(value) {
                    this.$store.commit('callForward/setTimeFrom', value);
                }
            },
            timeTo: {
                get() {
                    return this.$store.state.callForward.addTimeForm.timeTo;
                },
                set(value) {
                    this.$store.commit('callForward/setTimeTo', value);
                }
            },
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
        methods: {
            disableForm() {
                this.$store.commit('callForward/resetDefinedAlert');
                this.$store.commit('callForward/setActiveTimeForm', false);
            },
            addTime() {
                if (this.type === "new") {
                    this.$store.dispatch('callForward/createTimesetWithTime', {
                        time: [{ from: this.timeFrom, to: this.timeTo}],
                        weekday: this.selectedWeekday,
                        name: this.timeset
                    });
                } else if (this.type === "existing") {
                    this.$store.dispatch('callForward/appendTimeToTimeset', {
                        time: [{ from: this.timeFrom, to: this.timeTo}],
                        weekday: this.selectedWeekday,
                        name: this.timeset
                    })
                };
            }
        }
    }
</script>

<style lang="stylus" scoped>
@import '~variables'
    .add-times
        margin-right 30px
    .q-field
        margin 5px 0
    .q-card-main
        padding-bottom 8px
</style>
