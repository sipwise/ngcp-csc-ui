<template>
    <div
        class="times-card"
    >
        <q-list
            no-border
        >
            <csc-call-forward-time
                class="csc-call-forward-times"
                v-if="times.length > 0"
                v-for="(time, index) in times"
                :key="index"
                :time="time"
                :index="index"
                @delete-time="deleteTime"
                @delete-last-time="deleteLastTime"
            />
        </q-list>
        <div
            v-if="timesetTimesLoaded"
        >
            <csc-add-time-form
                v-if="activeTimeForm"
                type="existing"
                :timeset="timesetName"
                ref="addFormExisting"
            />
            <q-btn
                v-else
                flat
                icon="add"
                color="primary"
                class="add-time"
                @click="enableAddForm()"
            >
                {{ $t('pages.callForward.times.addTimeButton') }}
            </q-btn>
        </div>
    </div>
</template>

<script>
    import CscCallForwardTime from './CscCallForwardTime'
    import CscAddTimeForm from './CscAddTimeForm'
    import {
        QField,
        QBtn,
        QList
    } from 'quasar-framework'
    export default {
        name: 'csc-call-forward-times',
        props: [
            'times',
            'timesetName',
            'activeTimeForm',
            'timesetTimesLoaded'

        ],
        data () {
            return {
                addFormEnabled: false
            }
        },
        components: {
            CscCallForwardTime,
            CscAddTimeForm,
            QField,
            QBtn,
            QList
        },
        methods: {
            resetTimes() {
                this.$refs.addFormExisting.resetTimes();
            },
            enableAddForm() {
                this.$emit('enable-add-form');
            },
            deleteTime(data) {
                this.$emit('delete-time', data);
            },
            deleteLastTime(data) {
                this.$emit('delete-last-time', data);
            }
        }
    }
</script>

<style lang="stylus" rel="stylesheet/stylus">
    @import '../../../themes/quasar.variables.styl'

    .csc-call-forward-times
        padding 0

    .times-card
        max-width 100%
        margin auto
        margin-bottom 30px

    .add-time
        margin-top 0
</style>
