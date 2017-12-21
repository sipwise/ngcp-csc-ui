<template>
    <div>
        <q-item highlight v-for="(destination, index) in destinations">
            <q-item-main>
                <div class="dest-row">
                    <span v-if="index == 0"> {{ $t('pages.callForward.firstRing') }} </span>
                    <span v-else-if="index > 0"> {{ $t('pages.callForward.thenRing') }} </span>
                    <span class="dest-values"> {{ destination.destination | numberFormat }} </span>
                    <span v-if="isNumber(destination.destination)">
                        <span> {{ $t('pages.callForward.for') }} </span>
                        <span class="dest-values">{{ destination.timeout }}</span>
                        <span> {{ $t('pages.callForward.secs') }} </span>
                    </span>
                </div>
            </q-item-main>
            <q-item-side right>
                <q-btn color="negative" flat icon="delete" @click="deleteDestination(index)">Remove</q-btn>
            </q-item-side>
        </q-item>
    </div>
</template>

<script>
    import numberFormat from '../../../filters/number-format'
    import _ from 'lodash'
    import { showToast } from '../../../helpers/ui'
    import { QItem, QItemSide, Dialog, Toast, QBtn, QItemMain } from 'quasar-framework'
    export default {
        name: 'csc-destination',
        props: [
            'destinations',
            'destinationsetId'
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
        },
        methods: {
            isNumber(destination) {
                let dest = destination.split(/:|@/);
                return !isNaN(dest[1]);
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
                                    id: self.destinationsetId,
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
    display inline-block
    width 90%
    .dest-values
        font-weight 500
</style>
