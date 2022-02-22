<template>
    <q-item class="csc-entity csc-fax-item">
        <q-item-side
            icon="description"
            :color="color"
        />
        <q-item-main>
            <q-item-tile
                label
            >
                <span class="gt-sm csc-entity-title">
                    {{ $t('pages.conversations.fax') }}
                </span>
                <span class="gt-sm csc-entity-title">
                    {{ direction }}
                </span>
                <span class="csc-entity-title csc-phone-number">
                    {{ number | numberFormat }}
                </span>
            </q-item-tile>
            <q-item-tile
                sublabel
            >
                {{ fax.start_time | smartTime }}
            </q-item-tile>
            <q-item-tile
                v-if="fax.pages === 0"
                sublabel
            >
                No pages
            </q-item-tile>
            <q-item-tile
                v-else-if="fax.pages === 1"
                sublabel
            >
                {{ fax.pages }} {{ $t('pages.conversations.page') }}
            </q-item-tile>
            <q-item-tile
                v-else
                sublabel
            >
                {{ fax.pages }} {{ $t('pages.conversations.pages') }}
            </q-item-tile>
        </q-item-main>
        <q-item-side
            right
            class="csc-item-buttons"
        >
            <q-item-tile>
                <q-btn
                    icon="more_vert"
                    color="primary"
                    slot="right"
                    flat
                >
                    <q-popover
                        ref="callPopover"
                        anchor="bottom right"
                        self="top right"
                    >
                        <q-list
                            link
                            no-border
                            class="csc-toolbar-btn-popover"
                        >
                            <q-item
                                @click="downloadFax"
                            >
                                <q-item-side
                                    icon="file_download"
                                    color="primary"
                                />
                                <q-item-main
                                    :label="$t('pages.conversations.buttons.downloadFax')"
                                />
                            </q-item>
                            <q-item
                                v-if="callAvailable"
                                @click="startCall"
                            >
                                <q-item-side
                                    icon="call"
                                    color="primary"
                                />
                                <q-item-main
                                    :label="$t('pages.conversations.buttons.call')"
                                />
                            </q-item>
                        </q-list>
                    </q-popover>
                </q-btn>
            </q-item-tile>
        </q-item-side>
    </q-item>
</template>

<script>
    import CscCallOptionList from './CscCallOptionList'
    import {
        QList,
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
            'fax',
            'callAvailable'
        ],
        components: {
            QList,
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
        computed: {
            color() {
                return this.fax.status === 'FAILED' ? 'negative' : 'primary';
            },
            direction() {
                if(this.fax.direction === 'out') {
                    return 'to';
                }
                else {
                    return 'from';
                }
            },
            number () {
                if (this.fax.direction === 'out') {
                    return this.fax.callee
                }
                else {
                    return this.fax.caller
                }
            }
        },
        methods: {
            downloadFax() {
                this.$emit('download-fax', this.fax);
            },
            startCall() {
                this.$refs.callPopover.close();
                this.$emit('start-call', this.fax.caller);
            }
        }
    }
</script>

<style lang="stylus" rel="stylesheet/stylus">
</style>
