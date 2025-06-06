<template>
    <csc-page-sticky
        id="csc-page-call-forwarding"
        class="q-pa-lg"
    >
        <template
            v-if="hasSubscriberProfileAttributes(['cfu', 'cfna', 'cfb'])"
            #header
        >
            <q-btn
                flat
                icon="add"
                color="primary"
                :label="$t('Add forwarding')"
                data-cy="csc-add-forwarding"
                :disable="$wait.is('csc-cf-mappings-full')"
                :loading="$wait.is('csc-cf-mappings-full')"
            >
                <csc-popup-menu>
                    <csc-popup-menu-item
                        v-if="hasSubscriberProfileAttribute('cfu')"
                        color="primary"
                        :label="$t('Always')"
                        data-cy="csc-add-forwarding-available"
                        @click="createMapping({ type: 'cfu'})"
                    />
                    <csc-popup-menu-item
                        v-if="hasSubscriberProfileAttribute('cfna')"
                        color="primary"
                        :label="$t('If not available')"
                        data-cy="csc-add-forwarding-not-available"
                        @click="createMapping({ type: 'cfna'})"
                    />
                    <csc-popup-menu-item
                        v-if="hasSubscriberProfileAttribute('cfb')"
                        color="primary"
                        :label="$t('If busy')"
                        data-cy="csc-add-forwarding-busy"
                        @click="createMapping({ type: 'cfb'})"
                    />
                </csc-popup-menu>
                <template
                    #loading
                >
                    <csc-spinner />
                </template>
            </q-btn>
        </template>
        <div
            class="row justify-center q-pt-lg"
        >
            <div
                id="csc-wrapper-call-forwarding"
                class="col-xs-12 col-lg-8"
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
                    <csc-cf-group-item-primary-number />
                </q-list>
                <csc-popup-menu-ring-timeout
                    v-if="isRingTimeoutVisible"
                    :ring-timeout="ringTimeout"
                />
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
                    />
                </div>
            </div>
        </div>
    </csc-page-sticky>
</template>
<script>
import CscPageSticky from 'components/CscPageSticky'
import CscPopupMenu from 'components/CscPopupMenu'
import CscPopupMenuItem from 'components/CscPopupMenuItem'
import CscPopupMenuRingTimeout from 'components/CscPopupMenuRingTimeout'
import CscSpinner from 'components/CscSpinner'
import CscCfGroup from 'components/call-forwarding/CscCfGroup'
import CscCfGroupItemPrimaryNumber from 'components/call-forwarding/CscCfGroupItemPrimaryNumber'
import { mapActions, mapGetters, mapState } from 'vuex'
export default {
    name: 'CscPageCf',
    components: {
        CscPageSticky,
        CscCfGroupItemPrimaryNumber,
        CscSpinner,
        CscPopupMenu,
        CscPopupMenuItem,
        CscPopupMenuRingTimeout,
        CscCfGroup
    },
    computed: {
        ...mapState('callForwarding', [
            'mappings',
            'bNumberSetMap',
            'destinationSetMap',
            'sourceSetMap',
            'timeSetMap'
        ]),
        ...mapGetters('callForwarding', [
            'groups',
            'ringTimeout'
        ]),
        ...mapGetters('user', [
            'hasSubscriberProfileAttribute',
            'hasSubscriberProfileAttributes'
        ]),
        isRingTimeoutVisible () {
            return this.ringTimeout && this.groups.some((group) => group.type === 'cft')
        }
    },
    async mounted () {
        await this.loadAnnouncements()
        await this.loadMappingsFull()
    },
    methods: {
        ...mapActions('callForwarding', [
            'loadMappingsFull',
            'createMapping',
            'loadAnnouncements'
        ])
    }
}
</script>
