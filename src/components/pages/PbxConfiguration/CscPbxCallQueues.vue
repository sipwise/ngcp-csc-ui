
<template>
    <csc-page
        class="csc-list-page"
    >
        <!--TODO: No working?-->
        <div
            v-if="isCallQueueLoadingVisible"
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
                    :loading="callQueueGroupsAndSeatsLoading"
                    :subscriber="subscriber"
                />
            </q-list>
        </div>
        <div
            v-if="callQueueGroupsAndSeats.length === 0 && !callQueueGroupsAndSeatsRequesting"
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
                'isCallQueueLoadingVisible',
                'callQueueGroupsAndSeatsRequesting'
            ]),
            isMobile() {
                return Platform.is.mobile;
            }
        },
        methods: {
        },
        watch: {
        }
    }
</script>

<style lang="stylus" rel="stylesheet/stylus">
    @import '../../../themes/quasar.variables.styl';
</style>
