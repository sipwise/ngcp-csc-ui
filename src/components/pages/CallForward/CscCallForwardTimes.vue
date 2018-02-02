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
                    <!--DONE: 1. api call-->
                    <!--DONE: 2. store action and mutation-->
                    <!--DONE: 3. pass in load store on created()-->
                    <!--DONE: 4. implement compatibility check-->
                    <!--DONE: 5. display warning if isCompatible false, plus hide all other components on page (destinations and listing of times not visible)-->
                    <!--TODO: 6. create <csc-call-forward-time> component with field-->
                    <!--TODO: 7. style based on pbxconfig-->
                    <!--TODO: 8. create test/s-->
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
            'times'
        ],
        data () {
            return {
                addFormEnabled: false
            }
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
