
<template>
    <csc-page
        :is-list="true"
    >
        <div>
            <q-btn
                color="primary"
                @click="addNew"
            >
                ADD NEW DUMMY
            </q-btn>
            <q-field>
                <q-select
                    v-model="form.subscriber"
                    :options="callQueueGroupsAndSeatsOptions"
                />
            </q-field>
        </div>
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
        QSpinnerDots,
        QBtn
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
            QSpinnerDots,
            QBtn
        },
        data () {
            return {
                form: {
                    subscriber: null,
                    max_queue_length: null,
                    queue_wrap_up_time: null
                }
            }
        },
        mounted() {
            this.$store.dispatch('pbxConfig/listCallQueueGroupsAndSeats');
            this.$store.dispatch('pbxConfig/getAllGroupsAndSeats');
        },
        computed: {
            ...mapGetters('pbxConfig', [
                'callQueueGroupsAndSeats',
                'isListLoadingVisible',
                'isListRequesting',
                'callQueueGroupsAndSeatsOptions'
            ]),
            isMobile() {
                return Platform.is.mobile;
            }
        },
        methods: {
            addNew() {
                this.$store.dispatch('pbxConfig/addCallQueueConfig', {
                    id: this.form.subscriber,
                    config: {
                        max_queue_length: 150,
                        queue_wrap_up_time: 30
                    }
                });
            }
        },
        watch: {
        }
    }
</script>

<style lang="stylus" rel="stylesheet/stylus">
    @import '../../../themes/quasar.variables.styl';
</style>
