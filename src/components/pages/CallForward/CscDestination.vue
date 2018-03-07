<template>
    <div>
        <q-item v-for="(destination, index) in destinations">
            <q-item-main>
                <div class="dest-row">
                    <span v-if="index == 0">
                        {{ $t('pages.callForward.firstRing') }}
                    </span>
                    <span v-else-if="index > 0">
                        {{ $t('pages.callForward.thenRing') }}
                    </span>
                    <span class="dest-values">
                        {{ destination.destination | destinationFormat }}
                    </span>
                    <span v-if="isNumber(destination.destination)">
                        <span>
                            {{ $t('pages.callForward.for') }}
                        </span>
                        <span class="dest-values">
                            {{ destination.timeout }}
                        </span>
                        <span>
                            {{ $t('pages.callForward.secs') }}
                        </span>
                    </span>
                </div>
            </q-item-main>
            <q-item-side class="dest-btns" right>
                <span v-if="destinations.length > 1">
                    <q-btn flat
                        :class="{btnhidden: hasNoDownOption(index)}"
                        color="secondary"
                        icon="keyboard_arrow_down"
                        @click="moveDestination('down', index)">
                    </q-btn>
                    <q-btn flat
                        :class="{btnhidden: hasNoUpOption(index)}"
                        color="secondary"
                        icon="keyboard_arrow_up"
                        @click="moveDestination('up', index)">
                    </q-btn>
                </span>
                <q-btn flat
                    color="negative"
                    icon="delete"
                    @click="deleteDestination(index)">
                        {{ $t('buttons.remove') }}
                </q-btn>
            </q-item-side>
        </q-item>
    </div>
</template>

<script>
    import { mapState } from 'vuex'
    import numberFormat from '../../../filters/number-format'
    import _ from 'lodash'
    import { startLoading, stopLoading,
        showGlobalError } from '../../../helpers/ui'
    import { QItem, QItemMain, QItemSide,
        Dialog, QBtn } from 'quasar-framework'
    export default {
        name: 'csc-destination',
        props: [
            'destinations',
            'id',
            'prevDestId',
            'nextDestId'
        ],
        components: {
            QItem,
            QItemMain,
            QItemSide,
            Dialog,
            QBtn
        },
        computed: {
            ...mapState('callForward', [
                'changeDestinationState',
                'changeDestinationError'
            ])
        },
        watch: {
            changeDestinationState(state) {
                if (state === 'failed') {
                    stopLoading();
                    showGlobalError(this.changeDestinationError);
                }
                else if (state === 'succeeded') {
                    stopLoading();
                }
            }
        },
        methods: {
            hasNoDownOption(index) {
                return index === this.destinations.length-1 && !this.nextDestId;
            },
            hasNoUpOption(index) {
                return index === 0 && !this.prevDestId;
            },
            moveDestination(direction, index) {
                startLoading();
                this.$store.dispatch('callForward/changePositionOfDestination', {
                    destinations: this.destinations,
                    id: this.id,
                    index: index,
                    direction: direction,
                    nextId: this.nextDestId,
                    prevId: this.prevDestId
                });
            },
            isNumber(destination) {
                let dest = destination.split(/:|@/);
                if (dest[2] === 'fax2mail.local') {
                    return false;
                }
                else {
                    return !isNaN(dest[1]);
                }
            },
            deleteDestination(index) {
                let clonedDestinations = _.cloneDeep(this.destinations);
                let clonedDestination = clonedDestinations[index].destination;
                let indexInt = parseInt(index);
                let store = this.$store;
                let removeDestination = numberFormat(clonedDestination);
                let self = this;
                let isLastDestination = this.destinations.length === 1;
                clonedDestinations.splice(indexInt, 1);
                Dialog.create({
                    title: self.$t('pages.callForward.removeDialogTitle'),
                    message: self.$t('pages.callForward.removeDialogText', {
                        destination: removeDestination
                    }),
                    buttons: [
                        self.$t('buttons.cancel'),
                        {
                            label: self.$t('buttons.remove'),
                            color: 'negative',
                            handler () {
                                store.dispatch('callForward/deleteDestinationFromDestinationset', {
                                    id: self.id,
                                    data: clonedDestinations,
                                    deleteDestinationset: isLastDestination,
                                    removeDestination: removeDestination
                                })
                            }
                        }
                    ]
                });
            }
        }
    }
</script>

<style lang="stylus" rel="stylesheet/stylus">
    @import '../../../themes/quasar.variables.styl'

    .dest-row
        .dest-values
            font-weight 500

    .dest-btns
        display inline-block

    .btnhidden
        opacity 0

    .btnvisible
        opacity 1
</style>
