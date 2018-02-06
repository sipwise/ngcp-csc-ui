<template>
    <q-card class="times-card">
        <q-card-title class="times-title">
            Times
        </q-card-title>
        <q-card-main>
            <!--<div class="row no-wrap">-->
                <!--<p class="col-7 ">{{ $t('pages.callForward.times.weekday') }}</p>-->
                <!--<p class="col-2 hour-label">{{ $t('pages.callForward.times.from') }}</p>-->
                <!--<p class="col-2 hour-label">{{ $t('pages.callForward.times.to') }}</p>-->
                <!--<p class="col-auto hour-label">{{ $t('buttons.remove') }}</p>-->
            <!--</div>-->
            <csc-call-forward-time v-if="times.length > 0" v-for="(time, index) in times" :time="time" :index="index">
            </csc-call-forward-time>
        </q-card-main>
        <q-card-actions>
            <q-field v-if="!addFormEnabled">
                <q-btn color="primary"
                    class="add-time"
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
        QField, QBtn } from 'quasar-framework'
    export default {
        name: 'csc-call-forward-times',
        props: [
            'times',
            'timeset'
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
            QField,
            QBtn
        },
        computed: {
            ...mapState('callForward', {
                removeTimeState: 'removeTimeState',
                lastRemovedDay: 'lastRemovedDay',
                removeTimeError(state) {
                    return state.removeTimeError ||
                        this.$t('pages.callForward.times.removeErrorMessage');
                }
            })
        },
        methods: {
            enableAddForm() {
                console.log('enableAddForm()');
            },
            reload(timeset) {
                this.$store.dispatch('callForward/loadTimesetTimes', {
                    timeset: timeset
                });
            }
        },
        watch: {
            removeTimeState(state) {
                if (state === 'requesting') {
                    startLoading();
                } else if (state === 'failed') {
                    stopLoading();
                    showGlobalError(this.removeTimeError);
                } else if (state === 'succeeded') {
                    stopLoading();
                    showToast(this.$t('pages.callForward.times.removeTimesetSuccessMessage'));
                    this.reload(this.timeset);
                }
            }
        }
    }
</script>

<style lang="stylus">
@import '~variables'
.times-title
    color $primary
    padding-left 5px
    padding-bottom 8px
.times-card
    padding 0 35px 0 15px
    .q-field
        margin 5px 0
    .q-card-actions
        padding-top 0
        padding-left 10px
    .q-card-main
        padding-bottom 8px
    .add-time
        margin-left 14px
    .row
        p
            font-size 0.9 rem
            color $secondary
            margin-bottom 0
        .hour-label
            text-align center
</style>
