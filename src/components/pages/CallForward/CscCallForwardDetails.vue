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
                        :label="$t('If available')"
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
                <div
                    v-for="group in groups"
                    :key="group.cfm_id"
                >
                    <csc-cf-group
                        class="q-mb-lg"
                        :loading="$wait.is('csc-cf-mappings-full')"
                        :mapping="group"
                        :b-number-set="bNumberSetMap[group.bnumberset_id]"
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
import CscPopupMenu from 'components/CscPopupMenu'
import CscPopupMenuItem from 'components/CscPopupMenuItem'
import CscSpinner from 'components/CscSpinner'
import CscCfGroup from 'components/call-forwarding/CscCfGroup'
import CscCfGroupItemPrimaryNumber from 'components/call-forwarding/CscCfGroupItemPrimaryNumber'
import { mapActions, mapGetters, mapState } from 'vuex'
export default {
    name: 'CscCallForwardDetails',
    components: {
        CscPopupMenu,
        CscPopupMenuItem,
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
            'hasSubscriberProfileAttributes'
        ]),
        ...mapGetters('callForwarding', [
            'groups'
        ]),
        ...mapState('callForwarding', [
            'bNumberSetMap',
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
