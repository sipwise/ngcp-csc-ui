<template>
    <div class="times-card">
        <q-list no-border>
            <csc-call-forward-time
                class="csc-call-forward-times"
                v-if="times.length > 0"
                v-for="(time, index) in times"
                :key="index"
                :time="time"
                :index="index"
            />
        </q-list>
        <div v-if="timesetSectionActive">
            <csc-add-time-form
                v-if="activeTimeForm"
                type="existing"
                :timeset="timesetName"
                ref="addFormExisting"
            />
            <q-btn
                v-else
                color="primary"
                class="add-time"
                icon="fa-plus" flat
                @click="enableAddForm()"
            >
                {{ $t('pages.callForward.times.addTimeButton') }}
            </q-btn>
        </div>
    </div>
</template>

<script>
    import { mapGetters } from 'vuex'
    import CscCallForwardTime from './CscCallForwardTime'
    import CscAddTimeForm from './CscAddTimeForm'
    import { QField, QBtn, QList } from 'quasar-framework'
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
            QField,
            QBtn,
            QList
        },
        computed: {
            ...mapGetters('callForward', [
                'activeTimeForm',
                'timesetSectionActive'
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

    .csc-call-forward-times
        padding 0

    .times-card
        max-width 100%
        margin auto
        margin-bottom 30px

    .add-time
        margin-top 0
</style>
