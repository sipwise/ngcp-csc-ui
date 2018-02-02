<template>
    <q-card class="times-card">
        <q-card-title class="times-title">
            Times
        </q-card-title>
        <q-card-main>
            <q-list no-border>
                <div v-if="times.length === 0">
                    <q-item>
                        <div class="dest-row">
                            <span> {{ $t('pages.callForward.times.noTimeSet') }} </span>
                        </div>
                    </q-item>
                </div>
		        <div class="row no-wrap">
                    <p class="col-8 ">Weekday</p>
                    <p class="col-2 hour-label">From</p>
                    <p class="col-2 hour-label">To</p>
                </div>
                <csc-call-forward-time v-if="times.length > 0" v-for="(time, index) in times" :time="time">
                </csc-call-forward-time>
            </q-list>
        </q-card-main>
        <q-card-actions>
            <q-field v-if="!addFormEnabled">
                <q-btn color="primary"
                   icon="fa-plus" flat
                   @click="enableAddForm()">{{ $t('pages.callForward.times.addTimeButton') }}</q-btn>
            </q-field>
        </q-card-actions>
    </q-card>
</template>

<script>
    import numberFormat from '../../../filters/number-format'
    import CscCallForwardTime from './CscCallForwardTime'
    import { mapState } from 'vuex'
    import { startLoading, stopLoading,
        showGlobalError, showToast } from '../../../helpers/ui'
    import { QCard, QCardTitle, QCardMain, QCardActions,
        QList, QItem, QField, QBtn } from 'quasar-framework'
    export default {
        name: 'csc-call-forward-times',
        props: [
            'times'
        ],
        data () {
            return {
                addFormEnabled: false
            }
        },
        components: {
            CscCallForwardTime,
			QCard,
            QCardTitle,
            QCardMain,
            QCardActions,
            QList,
            QItem,
            QField,
            QBtn
        },
        computed: {
        },
        methods: {
            enableAddForm() {
                console.log('enableAddForm()');
            }
        },
        watch: {
        }
    }
</script>

<style lang="stylus">
@import '~variables'
.times-title
    color $primary
.times-card
    .row
        p
            font-size 0.9 rem
            color $secondary
        .hour-label
            text-align right
</style>
