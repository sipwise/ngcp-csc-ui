<template>
    <csc-page class="csc-list-page">
        <q-list
            no-border
            inset-separator
            sparse
            multiline
        >
            <q-item
                v-for="(assigned, index) in assignedSlots"
                :key="index"
                class="csc-entity"
            >
                <q-item-side
                    icon="touch app"
                    color="primary"
                />
                <q-item-main>
                    <q-item-tile label>
                        <span class="csc-entity-title">
                            {{ $t('speedDial.whenIDial', { slot: assigned.slot }) }}
                        </span>
                    </q-item-tile>
                    <q-item-tile sublabel>
                        {{ $t('speedDial.ring') }}
                        {{ assigned.destination | destinationFormat }}
                    </q-item-tile>
                </q-item-main>
                <q-item-side
                    right
                    class="csc-item-buttons"
                >
                    <q-item-tile>
                        <q-btn
                            flat
                            icon="delete"
                            color="negative"
                            slot="right"
                            @click="unassignSlot(assigned)"
                        />
                    </q-item-tile>
                </q-item-side>
            </q-item>
        </q-list>
        <div
            v-if="assignedSlots.length === 0"
            class="row justify-center"
        >
                {{ $t('speedDial.noResultsMessage') }}
        </div>
    </csc-page>
</template>

<script>
    import { mapGetters } from 'vuex'
    import {
        startLoading,
        stopLoading,
        showToast,
        showGlobalError
    } from '../../helpers/ui'
    import CscPage from '../CscPage'
    import {
        QList,
        QItem,
        QItemMain,
        QItemTile,
        QItemSide,
        QChip,
        QBtn,
        Dialog
    } from 'quasar-framework'

    export default {
        components: {
            CscPage,
            QList,
            QItem,
            QItemMain,
            QItemTile,
            QItemSide,
            QChip,
            QBtn
        },
        created() {
            this.$store.dispatch('speedDial/loadSpeedDials');
        },
        computed: {
            ...mapGetters('speedDial', [
                'assignedSlots',
                'speedDialLoadingState',
                'speedDialLoadingError',
                'unassignSlotState',
                'unassignSlotError',
                'lastUnassignedSlot'
            ])
        },
        methods: {
            unassignSlot(slot) {
                let self = this;
                let store = this.$store;
                Dialog.create({
                    title: self.$t('speedDial.removeDialogTitle'),
                    message: self.$t('speedDial.removeDialogText', {
                        slot: slot.slot
                    }),
                    buttons: [
                        self.$t('buttons.cancel'),
                        {
                            label: self.$t('buttons.remove'),
                            color: 'negative',
                            handler () {
                                store.dispatch('speedDial/unassignSpeedDialSlot', slot)
                            }
                        }
                    ]
                });
            }
        },
        watch: {
            speedDialLoadingState(state) {
                if (state === 'requesting') {
                    startLoading();
                }
                else if (state === 'failed') {
                    stopLoading();
                    showGlobalError(this.speedDialLoadingError);
                }
                else if (state === 'succeeded') {
                    stopLoading();
                }
            },
            unassignSlotState(state) {
                if (state === 'requesting') {
                    startLoading();
                }
                else if (state === 'failed') {
                    stopLoading();
                    showGlobalError(this.unassignSlotError);
                }
                else if (state === 'succeeded') {
                    stopLoading();
                    showToast(this.$t('speedDial.unassignSlotSuccessMessage', {
                        slot: this.lastUnassignedSlot
                    }));
                }
            }
        }
    }
</script>

<style lang="stylus" rel="stylesheet/stylus">
</style>
