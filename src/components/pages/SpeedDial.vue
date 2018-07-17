<template>
    <csc-page class="csc-list-page">
        <q-list
            no-border
            inset-separator
            sparse
            multiline
        >
            <q-item
                v-for="(assigned, index) in assignments"
                :key="index"
                class="csc-entity"
            >
                <q-item-side
                    icon="touch app"
                    color="primary"
                />
                <q-item-main>
                    <q-item-tile
                        v-if="isDesktop"
                        label
                    >
                        <span class="csc-entity-title">
                            {{ $t('speedDial.speedDialSlot') }} {{ assigned.slot }}
                        </span>
                        <q-chip
                            pointing="left"
                            color="primary"
                        >
                            {{ $t('speedDial.destination') }}:
                            <span class="csc-important">
                                {{ assigned.destination | destinationFormat }}
                            </span>
                        </q-chip>
                    </q-item-tile>
                    <q-item-tile
                        v-if="isMobile"
                        label
                    >
                        <span class="csc-entity-title">
                            {{ $t('speedDial.speedDialSlot') }} {{ assigned.slot }}
                        </span>
                    </q-item-tile>
                    <q-item-tile
                        v-if="isMobile"
                        sublabel
                    >
                        {{ $t('speedDial.assignedTo') }}
                        {{ assigned.destination | destinationFormat  }}
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
        data () {
            return {
                platform: this.$q.platform.is
            }
        },
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
                'assignments',
                'speedDialLoadingState',
                'speedDialLoadingError'
            ]),
            isMobile() {
                return this.platform.mobile;
            },
            isDesktop() {
                return this.platform.desktop;
            }
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
