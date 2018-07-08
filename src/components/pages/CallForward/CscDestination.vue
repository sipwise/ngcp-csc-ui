<template>
    <div>
        <q-item highlight separator class="csc-destination" :key="index" v-for="(destination, index) in destinations">
            <q-item-main>
                <div v-if="$q.platform.is.desktop" class="dest-row" :class="{ terminated: destination.terminated }">
                    <span v-if="index == 0">
                        {{ $t('pages.callForward.firstRing') }}
                    </span>
                    <span v-else-if="index > 0">
                        {{ $t('pages.callForward.thenRing') }}
                    </span>
                    <span class="dest-values">
                        {{ destination.destination | destinationFormat }}
                    </span>
                    <span v-if="isNonTerminating(destination.destination)">
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
                <div v-if="$q.platform.is.mobile" class="dest-row" :class="{ terminated: destination.terminated, mobile: mobileClasses }">
                    <q-item-tile class="dest-values" label>
                        <span v-if="!isNumber(destination.destination)">
                            <span v-if="index == 0">
                                {{ $t('pages.callForward.firstRing') }}
                            </span>
                            <span v-else-if="index > 0">
                                {{ $t('pages.callForward.thenRing') }}
                            </span>
                        </span>
                        {{ destination.destination | destinationFormat }}
                    </q-item-tile>
                    <q-item-tile class="dest-sublabel" sublabel>
                        <span v-if="index == 0 && isNumber(destination.destination)">
                            {{ $t('pages.callForward.firstRing') }}
                        </span>
                        <span v-else-if="index > 0 && isNumber(destination.destination)">
                            {{ $t('pages.callForward.thenRing') }}
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
                    </q-item-tile>
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
    import { QItem, QItemMain, QItemSide, QItemTile,
        Dialog, QBtn, QTooltip, QPopover, QList, Platform } from 'quasar-framework'
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
            QItemTile,
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
            ]),
            mobileClasses() {
                let classes = ['dest-row'];
                if(Platform.is.mobile) {
                    classes.push('mobile');
                }
                return classes;
            }
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
            isNonTerminating(destination) {
                let dest = destination.split(/:|@/);
                let host = dest[2];
                let type = host.split('.')[0];
                let isLocal = host.split('.')[1] === 'local' ? true : false;
                return type !== 'fax2mail' && type !== 'voicebox' && !isLocal;
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

    .dest-row.mobile
        padding 16px
        padding-left 0px
        .dest-values > span
            font-weight 300

    .dest-row.mobile .dest-sublabel span
        font-weight 300

    .dest-row.terminated.mobile
        color $grey

    .q-item.csc-destination
        padding 0

    .q-item-highlight.csc-destination:hover
        background-color lighten($primary, 70%)

    .dest-row
        color $secondary
        white-space nowrap
        overflow hidden
        font-size 16px
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
