<template>
    <q-card class="times-card" flat>
        <q-card-title class="times-title">
            Times
        </q-card-title>
        <q-card-main>
            <csc-call-forward-time v-if="times.length > 0" v-for="(time, index) in times"
                :time="time" :index="index" />
            <csc-add-time-form v-if="activeTimeForm" type="existing" :title="$t('pages.callForward.times.addCompanyHours')" :timesetName="timesetName" ref="addFormExisting" />
        </q-card-main>
        <q-card-actions v-if="!activeTimeForm">
            <q-field>
                <q-btn color="primary"
                    class="add-time"
                    icon="fa-plus" flat
                    @click="enableAddForm()">
                        {{ $t('pages.callForward.times.addTimeButton') }}
                </q-btn>
            </q-field>
        </q-card-actions>
    </q-card>
</template>

<script>
    import { mapState } from 'vuex'
    import CscCallForwardTime from './CscCallForwardTime'
    import CscAddTimeForm from './CscAddTimeForm'
    import { QCard, QCardTitle, QCardMain, QCardActions,
        QField, QBtn } from 'quasar-framework'
    export default {
        name: 'csc-call-forward-times',
        props: [
            'times',
            'timesetName'
        ],
        data () {
            return {
                addFormEnabled: false
            }
        },
        components: {
            CscCallForwardTime,
            CscAddTimeForm,
            QCard,
            QCardTitle,
            QCardMain,
            QCardActions,
            QField,
            QBtn
        },
        computed: {
            ...mapState('callForward', [
                'activeTimeForm'
            ])
        },
        methods: {
            resetTimes() {
                this.$refs.addFormExisting.resetTimes();
            },
            enableAddForm() {
                this.$store.commit('callForward/setActiveTimeForm', true);
            }
        }
    }
</script>

<style lang="stylus" rel="stylesheet/stylus">
    @import '../../../themes/quasar.variables.styl'

    .times-title
        color $primary
</style>
