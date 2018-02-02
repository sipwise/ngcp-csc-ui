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
                <div v-else v-for="(time, index) in times">
                    <p>{{ time.weekday }} | {{ time.from }} | {{ time.to }} </p>
                    <!--TODO: 1. api call-->
                    <!--TODO: 2. store action and mutation-->
                    <!--TODO: 3. load store on created()-->
                    <!--TODO: 2. create <csc-call-forward-time> component with field-->
                    <!--style based on pbxconfig-->
                </div>
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
    import { mapState } from 'vuex'
    import { startLoading, stopLoading,
        showGlobalError, showToast } from '../../../helpers/ui'
    import { QCard, QCardTitle, QCardMain, QCardActions,
        QList, QItem, QField, QBtn } from 'quasar-framework'
    export default {
        name: 'csc-call-forward-times',
        props: [
            'timeset'
        ],
        data () {
            return {
                //times: [],
                times: [
                    { weekday: "Monday", from: "08:00", to: "16:00" },
                    { weekday: "Tuesday", from: "08:00", to: "16:00" },
                    { weekday: "Wednesday", from: "08:00", to: "16:00" }
                ],
                addFormEnabled: false
            }
        },
        created() {
            this.$store.dispatch('callForward/loadTimesetTimes', {
                timeset: this.timeset
            });
        },
        components: {
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
</style>
