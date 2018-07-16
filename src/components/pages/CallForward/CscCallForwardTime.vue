<template>
    <q-item>
        <q-item-main>
            <q-item-tile class="row no-wrap csc-time">
                <q-input
                    class="col"
                    v-model="weekday"
                    readonly
                />
                <q-datetime
                    class="col"
                    color="primary"
                    v-model="from"
                    align="right"
                    type="time"
                    format24h
                    disable
                />
                <q-datetime
                    class="col"
                    color="primary"
                    v-model="to"
                    align="right"
                    type="time"
                    format24h
                    disable
                />
            </q-item-tile>
        </q-item-main>
        <q-item-side class="csc-call-forward-time-btn-container">
            <q-btn flat
                class="csc-call-forward-time-btn"
                color="negative"
                icon="delete"
                @click="deleteTime(index)">
            </q-btn>
        </q-item-side>
    </q-item>
</template>

<script>
    import { mapGetters } from 'vuex'
    import 'quasar-extras/animate/bounceInRight.css'
    import 'quasar-extras/animate/bounceOutRight.css'
    import {
        QField,
        QInput,
        QDatetime,
        Dialog,
        QBtn,
        QItem,
        QItemMain,
        QItemTile,
        QItemSide,
        Alert,
        date
    } from 'quasar-framework'

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
            QBtn,
            QItem,
            QItemMain,
            QItemTile,
            QItemSide
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
    @import '../../../themes/quasar.variables.styl'

    .q-item-side.csc-call-forward-time-btn-container
        margin-left 0
        .q-btn.csc-call-forward-time-btn
            .q-icon
                margin-right 0

    .csc-time
        .q-if-disabled::before
            background-image none
            background-color currentColor

</style>
