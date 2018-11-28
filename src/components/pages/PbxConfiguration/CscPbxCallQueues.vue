
<template>
    <csc-page
        :is-list="true"
    >
        <div
            v-if="isListLoadingVisible"
            class="row justify-center"
        >
            <q-spinner-dots
                color="primary"
                :size="40"
            />
        </div>
        <div>
            <q-list
                striped-odd
                no-border
                multiline
                :highlight="!isMobile"
            >
                <csc-pbx-call-queue
                    v-for="(subscriber, index) in callQueueGroupsAndSeats"
                    :key="index"
                    :subscriber="subscriber"
                    @save-queue-length="setQueueLength"
                    @save-wrap-up-time="setWrapUpTime"
                />
            </q-list>
        </div>
        <div
            v-if="callQueueGroupsAndSeats.length === 0 && !isListRequesting"
            class="row justify-center csc-no-entities"
        >
            {{ $t('pbxConfig.noCallQueues') }}
        </div>
    </csc-page>
</template>

<script>
    import CscPage from '../../CscPage'
    import CscPbxCallQueue from './CscPbxCallQueue'
    import { mapGetters } from 'vuex'
    import {
        QField,
        QInput,
        QIcon,
        QSelect,
        QChip,
        QList,
        QItem,
        QItemSide,
        QItemMain,
        QItemTile,
        Platform,
        QSpinnerDots
    } from 'quasar-framework'
    export default {
        components: {
            CscPbxCallQueue,
            CscPage,
            QField,
            QInput,
            QIcon,
            QSelect,
            QChip,
            QList,
            QItem,
            QItemSide,
            QItemMain,
            QItemTile,
            QSpinnerDots
        },
        data () {
            return {
            }
        },
        mounted() {
            this.$store.dispatch('pbxConfig/listCallQueueGroupsAndSeats');
        },
        computed: {
            ...mapGetters('pbxConfig', [
                'callQueueGroupsAndSeats',
                'isListLoadingVisible',
                'isListRequesting'
            ]),
            isMobile() {
                return Platform.is.mobile;
            }
        },
        methods: {
            setQueueLength(subscriber) {
                console.log('saveQueueLength()', subscriber);
                this.$store.dispatch('pbxConfig/setQueueLength', subscriber);
            },
            setWrapUpTime(subscriber) {
                console.log('saveWrapUpTime()', subscriber);
                this.$store.dispatch('pbxConfig/setWrapUpTime', subscriber);
            }
        },
        watch: {
        }
    }
</script>

<style lang="stylus" rel="stylesheet/stylus">
    @import '../../../themes/quasar.variables.styl';
</style>
