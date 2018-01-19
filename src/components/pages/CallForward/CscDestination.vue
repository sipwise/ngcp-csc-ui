<template>
    <div>
        <q-item highlight v-for="(destination, index) in destinations">
            <q-item-main>
                <div class="dest-row">
                    <span v-if="index == 0">
                        {{ $t('pages.callForward.firstRing') }}
                    </span>
                    <span v-else-if="index > 0">
                        {{ $t('pages.callForward.thenRing') }}
                    </span>
                    <span class="dest-values">
                        {{ destination.destination | numberFormat }}
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
						<!--TODO: Temporary dev helper, remember to remove-->
                        <span>
                            | Priority: {{ destination.priority }}
                        </span>
                    </span>
                </div>
            </q-item-main>
            <q-item-side class="dest-btns" right>
                <span v-if="destinations.length > 1">
                    <q-btn flat
                        class="btnhidden"
                        :class="{btnvisible: index < (destinations.length - 1)}"
                        color="secondary"
                        icon="keyboard_arrow_down"
                        @click="moveDestination('down', index)">
                    </q-btn>
                    <q-btn flat
                        class="btnhidden"
                        :class="{btnvisible: index > 0}"
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
// TODO
// TT#28062, CallForwarding: As a Customer, I want to change the order of Destinations
//AC:
//- I must be able to change the order of a single Destination by clicking buttons "up" and "down"
//
//Effort:
//- Priority is inferred by the upper/downer sibling
//- If we have Inter-DestinationSet movement of Destinations, we need to update priority and both DestinationSets
// NOTE: Considering to go for "store is truth" approach on this story, and basically just reorder without first doing a GET request. Problem with GET request first is that the index might have changed (we have no unique id for destinations, and no destination specific endpoint). I think a good approach is to first implement this feature with the straight forward approach of not checking the backend, and then improve in the future if needed. Maybe a "oops, the destinations have changed since your last refresh - do you want to reload first" error message/handling.

    import { mapState } from 'vuex'
    import numberFormat from '../../../filters/number-format'
    import _ from 'lodash'
    import { startLoading, stopLoading,
        showGlobalError, showToast } from '../../../helpers/ui'
    import { QItem, QItemMain, QItemSide, Toast,
        Dialog, QBtn } from 'quasar-framework'
    export default {
        name: 'csc-destination',
        props: [
            'destinations',
            'id',
            'groupName'
        ],
        components: {
            QItem,
            QItemMain,
            QItemSide,
            Dialog,
            Toast,
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
                } else if (state === 'succeeded') {
                    stopLoading();
                }
            }
        },
        methods: {
			moveDestination(direction, index) {
                startLoading();
                this.$store.dispatch('callForward/changePositionOfDestination', {
                    destinations: this.destinations,
                    id: this.id,
                    index: index,
                    direction: direction,
                    group: this.groupName
                });
			},
            isNumber(destination) {
                let dest = destination.split(/:|@/);
                if (dest[2] === 'fax2mail.local') {
                    return false;
                } else {
                    return !isNaN(dest[1]);
                };
            },
            deleteDestination(index) {
                let clonedDestinations = _.cloneDeep(this.destinations);
                let indexInt = parseInt(index);
                let store = this.$store;
                let removeDestination = numberFormat(this.destinations[index].destination);
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
                                    deleteDestinationset: isLastDestination }).then((result) => {
                                        store.dispatch('callForward/loadAlwaysEverybodyDestinations');
                                        showToast(self.$t('pages.callForward.removeSuccessMessage', {
                                            destination: removeDestination
                                        }));
                                    }).catch((err) => {
                                        showToast(self.$t('pages.callForward.removeErrorMessage'));
                                    });
                            }
                        }
                    ]
                });
            }
        }
    }
</script>

<style lang="stylus">
@import '~variables'
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
