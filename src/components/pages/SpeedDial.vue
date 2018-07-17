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
                            @click="deleteAssignment(index)"
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
        QBtn
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
                'speedDialLoadingError'
            ])
        },
        methods: {
            deleteAssignment(index) {
                console.log('deleteAssignment(), index', index);
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
            }
        }
    }
</script>

<style lang="stylus" rel="stylesheet/stylus">
</style>
