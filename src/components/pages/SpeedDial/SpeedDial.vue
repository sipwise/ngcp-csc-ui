<template>
    <csc-page class="csc-list-page">
        <q-list
            no-border
            inset-separator
            sparse
            multiline
        >
            <q-item
                v-for="(assignedSlot, index) in assignedSlots"
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
                            {{ $t('speedDial.speedDialSlot') }} {{ assignedSlot.slot }}
                        </span>
                        <q-chip
                            pointing="left"
                            color="primary"
                            @click="logPlatform"
                        >
                            {{ $t('speedDial.destination') }}:
                            <span class="csc-important">{{ assignedSlot.destination | destinationFormat }}</span>
                        </q-chip>
                    </q-item-tile>
                    <q-item-tile
                        v-if="isMobile"
                        label
                    >
                        <span class="csc-entity-title">
                            {{ $t('speedDial.speedDialSlot') }} {{ assignedSlot.slot }}
                        </span>
                    </q-item-tile>
                    <q-item-tile
                        v-if="isMobile"
                        sublabel
                    >
                        {{ $t('speedDial.assignedTo') }} {{ assignedSlot.destination | destinationFormat  }}
                    </q-item-tile>
                </q-item-main>
                <q-item-side
                    right
                    class="csc-item-buttons"
                >
                    <q-item-tile>
                        <q-btn
                            icon="delete"
                            color="negative"
                            slot="right"
                            flat
                        />
                    </q-item-tile>
                </q-item-side>
            </q-item>
        </q-list>
    </csc-page>
</template>

<script>
    import CscPage from '../../CscPage'
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
                platform: this.$q.platform.is,
                assignedSlots: [
                    {
                        destination: "sip:dest0@10.15.17.240",
                        slot: "*0"
                    },
                    {
                        destination: "sip:dest8@10.15.17.240",
                        slot: "*8"
                    },
                    {
                        destination: "sip:dest3@10.15.17.240",
                        slot: "*3"
                    }
                ]
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
        computed: {
            isMobile() {
                return this.platform.mobile;
            },
            isDesktop() {
                return this.platform.desktop;
            }
        },
        methods: {
            logPlatform() {
                console.log('platform:', this.platform);
            }
        },
        watch: {
        }
    }
</script>

<style lang="stylus" rel="stylesheet/stylus">
</style>
