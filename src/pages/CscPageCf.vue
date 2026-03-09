<template>
    <csc-page-sticky
        id="csc-page-call-forwarding"
        class="q-pa-lg"
    >
        <template
            v-if="hasSomeSubscriberProfileAttributes(['cfu', 'cfna', 'cfb', 'cft'])"
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
                @click=" this.enableCfAddForm()"
            >
                <template
                    #loading
                >
                    <csc-spinner />
                </template>
            </q-btn>
        </template>
        <template
            #toolbar
        >
            <csc-cf-add-form
                v-if="!isCfAddFormDisabled"
                ref="addCfForm"
                class="q-mb-md q-pa-md"
                :loading="$wait.is('csc-cf-mappings-full')"
                @save="createCf($event)"
                @cancel="disableCfAddForm"
            />
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
                    :subscriber-id="getSubscriberId"
                />
                <div
                    v-for="group in groups"
                    :key="group.cfm_id"
                >
                    <csc-cf-group
                        class="q-mb-lg"
                        :class="{ 'cf-group-disabled': !group.enabled }"
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
import CscCfAddForm from 'components/call-forwarding/CscCfAddForm'
import CscCfGroup from 'components/call-forwarding/CscCfGroup'
import CscCfGroupItemPrimaryNumber from 'components/call-forwarding/CscCfGroupItemPrimaryNumber'
import {
    mapActions,
    mapGetters,
    mapMutations,
    mapState
} from 'vuex'
export default {
    name: 'CscPageCf',
    components: {
        CscPageSticky,
        CscCfGroupItemPrimaryNumber,
        CscSpinner,
        CscPopupMenu,
        CscPopupMenuItem,
        CscPopupMenuRingTimeout,
        CscCfGroup,
        CscCfAddForm
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
            'ringTimeout',
            'isCfAddFormDisabled'
        ]),
        ...mapGetters('user', [
            'hasSubscriberProfileAttribute',
            'hasSomeSubscriberProfileAttributes',
            'getSubscriberId'
        ]),
        isRingTimeoutVisible () {
            return this.ringTimeout && this.groups.some((group) => group.type === 'cft')
        }
    },
    async created () {
        await this.loadAnnouncements()
        await this.loadMappingsFull(this.getSubscriberId)
    },
    beforeUnmount () {
        this.disableCfAddForm()
        this.resetCallForwardingState()
    },
    methods: {
        ...mapActions('callForwarding', [
            'loadMappingsFull',
            'createMapping',
            'loadAnnouncements',
            'resetCallForwardingState'
        ]),
        ...mapMutations('callForwarding', [
            'enableCfAddForm',
            'disableCfAddForm'
        ]),
        async createCf (data) {
            await this.createMapping(data)
            this.disableCfAddForm()
        }
    }
}
</script>
<style lang="sass" scoped>
.cf-group-disabled
    opacity: 0.6
    filter: grayscale(30%)

    :deep(*)
        pointer-events: auto !important
        cursor: pointer !important
</style>
