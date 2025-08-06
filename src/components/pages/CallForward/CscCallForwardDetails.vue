<template>
    <q-list
        class="col col-xs-12 col-md-6"
    >
        <q-item
            class="row justify-center q-pt-lg"
        >
            <q-btn
                flat
                icon="add"
                color="primary"
                :label="$t('Add forwarding')"
                :disable="$wait.is('csc-cf-mappings-full')"
                :loading="$wait.is('csc-cf-mappings-full')"
            >
                <csc-popup-menu>
                    <csc-popup-menu-item
                        v-if="hasSubscriberProfileAttribute('cfu')"
                        color="primary"
                        :label="$t('Always')"
                        @click="createMapping({ type: 'cfu', subscriberId: id})"
                    />
                    <csc-popup-menu-item
                        v-if="hasSubscriberProfileAttribute('cfna')"
                        color="primary"
                        :label="$t('If not available')"
                        @click="createMapping({ type: 'cfna', subscriberId: id})"
                    />
                    <csc-popup-menu-item
                        v-if="hasSubscriberProfileAttribute('cfb')"
                        color="primary"
                        :label="$t('If busy')"
                        @click="createMapping({ type: 'cfb', subscriberId: id})"
                    />
                </csc-popup-menu>
                <template
                    #loading
                >
                    <csc-spinner />
                </template>
            </q-btn>
        </q-item>
        <q-item
            class="row justify-center q-pt-lg"
        >
            <div
                id="csc-wrapper-call-forwarding"
                class="col col-xs-12 col-md-6"
            >
                <q-list
                    v-if="groups.length === 0 && !$wait.is('csc-cf-mappings-full')"
                    dense
                    separator
                >
                    <q-item
                        :disable="$wait.is('csc-cf-mappings-full')"
                    >
                        <q-item-section>
                            <q-item-label
                                class="text-weight-bold"
                            >
                                {{ $t('Always') }}
                            </q-item-label>
                        </q-item-section>
                    </q-item>
                    <csc-cf-group-item-primary-number
                        :primary-number-source="getPrimaryNumberSource"
                    />
                </q-list>
                <csc-popup-menu-ring-timeout
                    v-if="isRingTimeoutVisible"
                    :ring-timeout="ringTimeout"
                    :subscriber-id="id"
                />
                <div
                    v-for="group in groups"
                    :key="group.cfm_id"
                >
                    <csc-cf-group
                        class="q-mb-lg"
                        :loading="$wait.is('csc-cf-mappings-full')"
                        :mapping="group"
                        :destination-set="destinationSetMap[group.destinationset_id]"
                        :source-set="sourceSetMap[group.sourceset_id]"
                        :time-set="timeSetMap[group.timeset_id]"
                        :subscriber-id="id"
                    />
                </div>
            </div>
        </q-item>
    </q-list>
</template>

<script>
import {
    mapState,
    mapGetters,
    mapActions
} from 'vuex'
import CscCfGroup from 'components/call-forwarding/CscCfGroup'
import CscSpinner from 'components/CscSpinner'
import CscPopupMenu from 'components/CscPopupMenu'
import CscPopupMenuItem from 'components/CscPopupMenuItem'
import CscPopupMenuRingTimeout from 'components/CscPopupMenuRingTimeout'
import CscCfGroupItemPrimaryNumber from 'components/call-forwarding/CscCfGroupItemPrimaryNumber'
export default {
    name: 'CscCallForwardDetails',
    components: {
        CscPopupMenu,
        CscPopupMenuItem,
        CscPopupMenuRingTimeout,
        CscCfGroup,
        CscCfGroupItemPrimaryNumber,
        CscSpinner
    },
    props: {
        id: {
            type: String,
            required: true
        }
    },
    data () {
        return {
            changes: null,
            selectedTab: this.initialTab
        }
    },
    computed: {
        ...mapState('pbxGroups', [
            'groupSelected'
        ]),
        ...mapState('pbxSeats', [
            'seatSelected'
        ]),
        ...mapGetters('user', [
            'hasSubscriberProfileAttribute',
            'hasSomeSubscriberProfileAttributes'
        ]),
        ...mapGetters('callForwarding', [
            'groups',
            'ringTimeout'
        ]),
        ...mapState('callForwarding', [
            'destinationSetMap',
            'sourceSetMap',
            'timeSetMap'
        ]),
        getPrimaryNumberSource () {
            if (this.groupSelected) {
                return this.groupSelected
            } else if (this.seatSelected) {
                return this.seatSelected
            }
            return null
        },
        isRingTimeoutVisible () {
            return this.ringTimeout && this.groups.some((group) => group.type === 'cft')
        }
    },
    async mounted () {
        await this.loadMappingsFull(this.id)
    },
    methods: {
        ...mapActions('callForwarding', [
            'loadMappingsFull',
            'createMapping'
        ])
    }
}
</script>
