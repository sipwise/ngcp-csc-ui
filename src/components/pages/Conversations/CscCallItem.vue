<template>
    <q-item
        :class="sleekMode ? 'csc-call-item-sleek-mode' : ''"
    >
        <q-item-section
            side
            top
        >
            <q-icon
                :name="icon"
                :color="color"
            />
        </q-item-section>
        <q-item-section>
            <q-item-label
                class="text-subtitle1"
            >
                {{ typeTerm }}
                {{ direction }}
                {{ $filters.destinationFormat(number) }}
            </q-item-label>
            <q-item-label
                caption
            >
                {{ $filters.smartTime(call.start_time) }}
            </q-item-label>
            <q-item-label
                caption
            >
                {{ $t('Duration') }}: {{ call.duration }}
            </q-item-label>
            <q-item-label
                v-if="!sleekMode"
                caption
            >
                <span>
                    {{ $t('Cost') }}
                </span>
                <span>
                    {{ $filters.wholeCurrency(totalCustomerCostRounded) }}
                </span>
                <span
                    v-if="call.currency && call.currency.length > 0"
                >
                    ({{ call.currency }})
                </span>
            </q-item-label>
        </q-item-section>
        <q-item-section
            v-if="!sleekMode"
            side
        >
            <csc-more-menu>
                <csc-popup-menu-item-start-call
                    v-if="callAvailable"
                    @click="startCall"
                />
                <csc-popup-menu-item
                    icon="call_received"
                    color="primary"
                    :label="blockIncomingLabel"
                    @click="toggleBlockIncoming"
                />
                <csc-popup-menu-item
                    icon="call_made"
                    color="primary"
                    :label="blockOutgoingLabel"
                    @click="toggleBlockOutgoing"
                />
                <csc-popup-menu-item
                    icon="block"
                    color="primary"
                    :label="blockBothLabel"
                    @click="toggleBlockBoth"
                />
                <csc-popup-menu-item
                    icon="fas fa-address-book"
                    color="primary"
                    :label="$t('Add to phonebook')"
                    @click="addToPhonebook"
                />
            </csc-more-menu>
        </q-item-section>
    </q-item>
</template>

<script>
import CscMoreMenu from 'components/CscMoreMenu'
import CscPopupMenuItem from 'components/CscPopupMenuItem'
import CscPopupMenuItemStartCall from 'components/CscPopupMenuItemStartCall'
import _ from 'lodash'
import { Platform } from 'quasar'
import {
    callIcon,
    callIconColor
} from 'src/helpers/call-utils'
export default {
    name: 'CscCallItem',
    components: { CscPopupMenuItemStartCall, CscPopupMenuItem, CscMoreMenu },
    props: {
        call: {
            type: Object,
            default: null
        },
        callAvailable: {
            type: Boolean,
            default: false
        },
        blockIncomingLabel: {
            type: String,
            default: ''
        },
        blockOutgoingLabel: {
            type: String,
            default: ''
        },
        blockBothLabel: {
            type: String,
            default: ''
        },
        blockBothPossible: {
            type: Boolean,
            default: false
        },
        sleekMode: {
            type: Boolean,
            default: false
        }
    },
    emits: ['toggle-block-both', 'toggle-block-outgoing', 'toggle-block-incoming', 'start-call', 'add-to-phonebook'],
    data () {
        return {}
    },
    computed: {
        number () {
            if (this.call.direction === 'out') {
                return this.call.callee
            }
            return this.call.caller
        },
        totalCustomerCostRounded () {
            const formatter = new Intl.NumberFormat('en-US', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            })

            return formatter.format(this.call.total_customer_cost)
        },
        numberDialBack () {
            if (_.isObject(this.call.relatedCall)) {
                return this.call.relatedCall.caller
            } else if (this.call.direction === 'out') {
                return this.call.callee
            }
            return this.call.caller
        },
        direction () {
            if (this.call.direction === 'out') {
                return this.$t('to')
            }
            return this.$t('from')
        },
        typeTerm () {
            if (this.call.call_type === 'call') {
                return this.$t('Call')
            }
            return this.$t('Call forwarded')
        },
        icon () {
            return callIcon(this.call)
        },
        color () {
            return callIconColor(this.call)
        },
        isMobile () {
            return Platform.is.mobile
        }
    },
    methods: {
        startCall () {
            this.$emit('start-call', this.numberDialBack)
        },
        toggleBlockIncoming () {
            this.$emit('toggle-block-incoming')
        },
        toggleBlockOutgoing () {
            this.$emit('toggle-block-outgoing')
        },
        toggleBlockBoth () {
            this.$emit('toggle-block-both')
        },
        addToPhonebook () {
            this.$emit('add-to-phonebook', this.numberDialBack)
        }
    }
}
</script>

<style lang="sass" rel="stylesheet/sass">
    .csc-call-item-sleek-mode
        padding: 2px !important
</style>
