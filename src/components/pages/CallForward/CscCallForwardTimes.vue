<template>
    <q-card class="times-card">
        <q-card-title class="times-title">
            Times
        </q-card-title>
        <q-card-main>
            <csc-call-forward-time v-if="times.length > 0" v-for="(time, index) in times" :time="time" :index="index">
            </csc-call-forward-time>
        </q-card-main>
        <csc-add-time-form type="existing" :title="$t('pages.callForward.times.addCompanyHours')" timeset="Company Hours">
        </csc-add-time-form>
        <q-card-actions v-if="!activeTimeForm">
            <q-field>
                <q-btn color="primary"
                    class="add-time"
                    icon="fa-plus" flat
                    @click="enableAddForm()">{{ $t('pages.callForward.times.addTimeButton') }}</q-btn>
            </q-field>
        </q-card-actions>
    </q-card>
</template>

<script>
    import { mapState } from 'vuex'
    import numberFormat from '../../../filters/number-format'
    import CscCallForwardTime from './CscCallForwardTime'
    import CscAddTimeForm from './CscAddTimeForm'
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
            CscAddTimeForm,
            QCard,
            QCardTitle,
            QCardMain,
            QCardActions,
            QField,
            QBtn
        },
        computed: {
            ...mapState('callForward', {
                activeTimeForm: 'activeTimeForm'
            })
        },
        methods: {
            enableAddForm() {
                this.$store.commit('callForward/setActiveTimeForm', true);
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
