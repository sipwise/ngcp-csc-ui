<template>
    <q-item class="csc-entity csc-call-item">
        <q-item-side
            :icon="icon"
            :color="color"
        />
        <q-item-main>
            <q-item-tile label>
                <span
                    class="gt-sm csc-entity-title"
                >
                    {{ typeTerm }}
                </span>
                <span
                    class="gt-sm csc-entity-title"
                >
                    {{ direction }}
                </span>
                <span
                    class="csc-entity-title csc-phone-number"
                >
                    {{ number | destinationFormat }}
                </span>
            </q-item-tile>
            <q-item-tile sublabel>
                {{ call.start_time | smartTime }}
            </q-item-tile>
            <q-item-tile sublabel>
                <span
                    class="csc-entity-subtitle"
                >
                    {{ $t('pages.conversations.cost') }}
                </span>
                <span
                    class="csc-entity-subtitle"
                >
                    {{ call.customer_cost | wholeCurrency }}
                </span>
                <span
                    v-if="call.currency.length > 0"
                    class="csc-entity-subtitle"
                >
                    ({{ call.currency }})
                </span>
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
                            item-separator
                            link
                            no-border
                            class="csc-toolbar-btn-popover">
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
    import _ from 'lodash'
    import CscCallOptionList from './CscCallOptionList'
    import {
        QList,
        QItem,
        QItemSide,
        QItemMain,
        QItemTile,
        QBtn,
        QPopover,
        Platform
    } from 'quasar-framework'
    export default {
        name: 'csc-call-item',
        props: [
            'call',
            'callAvailable'
        ],
        components: {
            QList,
            QItem,
            QItemSide,
            QItemMain,
            QItemTile,
            QBtn,
            QPopover,
            CscCallOptionList
        },
        data () {
            return {}
        },
        computed: {
            number() {
                if(this.call.direction === 'out') {
                    return this.call.callee;
                }
                else {
                    return this.call.caller;
                }
            },
            numberDialBack() {
                if (_.isObject(this.call.relatedCall)) {
                    return this.call.relatedCall.caller;
                }
                else if(this.call.direction === 'out') {
                    return this.call.callee;
                }
                else {
                    return this.call.caller;
                }
            },
            direction() {
                if(this.call.direction === 'out') {
                    return 'to';
                }
                else {
                    return 'from';
                }
            },
            typeTerm() {
                if(this.call.call_type === 'call') {
                    return 'Call';
                }
                else {
                    return 'Call forwarded'
                }
            },
            icon() {
                if(this.call.call_type === 'cfu' || this.call.call_type === 'cfna' ||
                    this.call.call_type === 'cfb' && this.call.call_type === 'cft') {
                    return 'phone_forwarded';
                }
                else if (this.call.call_type === 'call' && this.call.direction === 'in' && this.call.status === 'cancel') {
                    return 'call_missed';
                }
                else if (this.call.call_type === 'call' && this.call.direction === 'in') {
                    return 'call_received';
                }
                else if (this.call.call_type === 'call' && this.call.direction === 'out') {
                    return 'call_made';
                }
                else {
                    return 'phone';
                }
            },
            color() {
                if (this.call.call_type === 'call' && (this.call.status === 'cancel' ||
                    this.call.status === 'offline' || this.call.status === 'noanswer')) {
                    return 'negative';
                }
                else if (this.call.call_type === 'call' && (this.call.direction === 'in' ||
                    this.call.direction === 'out')) {
                    return 'primary';
                }
                else {
                    return 'white';
                }
            },
            isMobile() {
                return Platform.is.mobile;
            }
        },
        methods: {
            startCall() {
                this.$refs.callPopover.close();
                this.$emit('start-call', this.numberDialBack);
            }
        }
    }
</script>

<style lang="stylus" rel="stylesheet/stylus">
</style>
