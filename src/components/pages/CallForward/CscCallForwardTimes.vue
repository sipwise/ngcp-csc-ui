<template>
    <q-card class="times-card">
        <q-card-title class="times-title">
            Times
        </q-card-title>
        <q-card-main>
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
        methods: {
            enableAddForm() {
                console.log('enableAddForm()');
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
</style>
