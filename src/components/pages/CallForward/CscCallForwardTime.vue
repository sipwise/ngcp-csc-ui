<template>
    <q-field class="time-field">
        <div class="row no-wrap">
            <q-input class="col-7"
                v-model="weekday"
                readonly />
            <q-datetime
                class="col-2"
                color="primary"
                v-model="from"
                align="right"
                type="time"
                format24h
                readonly />
            <q-datetime
                class="col-2"
                color="primary"
                v-model="to"
                align="right"
                type="time"
                format24h
                readonly />
            <q-btn flat
                class="col-1"
                color="negative"
                icon="delete"
                @click="deleteTime(index)">
            </q-btn>
        </div>
    </q-field>
</template>

<script>
    import { QField, QInput, QDatetime, Dialog,
        QBtn, Alert, date } from 'quasar-framework'
    import { mapGetters } from 'vuex'
    import 'quasar-extras/animate/bounceInRight.css'
    import 'quasar-extras/animate/bounceOutRight.css'
    export default {
        name: 'csc-call-forward-time',
        props: [
            'time',
            'index'
        ],
        data () {
            return {
            }
        },
        components: {
            QField,
            QInput,
            QDatetime,
            Dialog,
            QBtn
        },
        computed: {
            ...mapGetters('callForward', {
                timesLength: 'getTimesetTimesLength'
            }),
            weekday() {
                return this.time.weekday;
            },
            from() {
                return date.buildDate({
                    hours: this.time.from.split(':')[0],
                    minutes: this.time.from.split(':')[1]
                });
            },
            to() {
                return date.buildDate({
                    hours: this.time.to.split(':')[0],
                    minutes: this.time.to.split(':')[1]
                });
            }
        },
        methods: {
            deleteTime(index) {
                let self = this;
                let store = this.$store;
                if (this.timesLength <= 1) {
                    Alert.create({
                        enter: 'bounceInRight',
                        leave: 'bounceOutRight',
                        position: 'top-center',
                        html: self.$t('pages.callForward.times.removeLastDialogText'),
                        icon: 'warning',
                        actions: [
                            {
                                label: self.$t('buttons.remove'),
                                handler () {
                                    store.dispatch('callForward/deleteTimesetById')
                                }
                            },
                            {
                                label: self.$t('buttons.cancel')
                            }
                        ]
                    });
                }
                else {
                    Dialog.create({
                        title: self.$t('pages.callForward.times.removeDialogTitle'),
                        message: self.$t('pages.callForward.times.removeDialogText', {
                            day: self.weekday
                        }),
                        buttons: [
                            self.$t('buttons.cancel'),
                            {
                                label: self.$t('buttons.remove'),
                                color: 'negative',
                                handler () {
                                    store.dispatch('callForward/deleteTimeFromTimeset', {
                                        index: index,
                                        removedDay: self.weekday
                                    })
                                }
                            }
                        ]
                    });
                }
            }
        }
    }
</script>

<style lang="stylus" rel="stylesheet/stylus">
</style>
