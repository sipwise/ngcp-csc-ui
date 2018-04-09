<template>
    <div>
        <q-item class="csc-destination" :key="index" v-for="(destination, index) in destinations">
            <q-item-main>
                <div class="dest-row" :class="{ terminated: destination.terminated }">
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
                    <q-tooltip v-if="destination.terminated">
                        {{ $t('pages.callForward.terminatedTooltip') }}
                    </q-tooltip>
                </div>
            </q-item-main>
            <q-item-side class="dest-btns" icon="more_vert" right>
                <q-popover ref="popover">
                    <q-list separator link>
                        <q-item v-if="destinations.length > 1 && !hasNoUpOption(index)" @click="moveDestination('up', index), $refs.popover[index].close()">
                            <q-item-main :label="$t('buttons.moveUp')" />
                            <q-item-side icon="keyboard_arrow_up" color="secondary"></q-item-side>
                        </q-item>
                        <q-item v-if="destinations.length > 1 && !hasNoDownOption(index)" @click="moveDestination('down', index), $refs.popover[index].close()">
                            <q-item-main :label="$t('buttons.moveDown')" />
                            <q-item-side icon="keyboard_arrow_down" color="secondary"></q-item-side>
                        </q-item>
                        <q-item @click="deleteDestination(index), $refs.popover[index].close()">
                            <q-item-main :label="$t('buttons.remove')" />
                            <q-item-side icon="delete" color="negative"></q-item-side>
                        </q-item>
                    </q-list>
                </q-popover>
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
        Dialog, QBtn, QTooltip, QPopover, QList } from 'quasar-framework'
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
            QBtn,
            QTooltip,
            QPopover,
            QList
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


    .q-item.csc-destination
        padding 0px

    .dest-row
        white-space nowrap;
        overflow hidden;
        font-size 14px
        .dest-values
            font-weight 500

    .dest-row.terminated
        color $grey

    .dest-btns
        display inline-block
        position absolute 
        right 0px

    .btnhidden
        opacity 0

    .btnvisible
        opacity 1
</style>
