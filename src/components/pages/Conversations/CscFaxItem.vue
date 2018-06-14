<template>
    <q-item class="csc-entity csc-fax-item">
        <q-item-side
            icon="description"
            color="primary"
        />
        <q-item-main>
            <q-item-tile
                label
            >
                <span class="gt-sm csc-entity-title">Fax from </span>
                <span class="csc-entity-title">{{ fax.caller | numberFormat }}</span>
            </q-item-tile>
            <q-item-tile
                sublabel
            >{{ fax.start_time | smartTime }}
            </q-item-tile>
            <q-item-tile
                v-if="fax.pages === 0"
                sublabel
            >No pages</q-item-tile>
            <q-item-tile
                v-else-if="fax.pages === 1"
                sublabel
            >{{ fax.pages }} page
            </q-item-tile>
            <q-item-tile
                v-else
                sublabel
            >{{ fax.pages }} pages
            </q-item-tile>
        </q-item-main>
        <q-item-side
            right
            class="csc-item-buttons"
        >
            <q-item-tile>
                <q-btn
                    icon="file_download"
                    color="primary"
                    slot="right"
                    flat
                    @click="downloadFax"
                >
                </q-btn>
                <q-btn
                    icon="call"
                    color="primary"
                    slot="right"
                    flat
                >
                    <q-popover ref="callPopover" anchor="bottom right" self="top right">
                        <csc-call-option-list
                            ref="callOptionPopover"
                            @init-call="initCall"
                        />
                    </q-popover>
                </q-btn>
            </q-item-tile>
        </q-item-side>
    </q-item>
</template>

<script>
    import CscCallOptionList from './CscCallOptionList'
    import {
        QItem,
        QItemSide,
        QItemMain,
        QItemTile,
        QPopover,
        QBtn
    } from 'quasar-framework'
    export default {
        name: 'csc-fax-item',
        props: [
            'fax'
        ],
        components: {
            QItem,
            QItemSide,
            QItemMain,
            QItemTile,
            QPopover,
            QBtn,
            CscCallOptionList
        },
        data () {
            return {}
        },
        methods: {
            initCall(media) {
                this.$refs.callPopover.close();
                this.$emit('init-call', {
                    media: media,
                    number: this.fax.caller
                });
            },
            downloadFax() {
                this.$emit('download-fax', this.fax);
            }
        }
    }
</script>

<style lang="stylus" rel="stylesheet/stylus">
</style>
