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
                data-cy="csc-add-pbx-forwarding"
                :label="$t('Add forwarding')"
                :disable="$wait.is('csc-cf-mappings-full')"
                :loading="$wait.is('csc-cf-mappings-full')"
                @click="this.enableCfAddForm()"
            >
                <template
                    #loading
                >
                    <csc-spinner />
                </template>
            </q-btn>
        </q-item>
        <q-item
            class="row justify-center"
            v-if="!isCfAddFormDisabled"
        >
            <div class="csc-cf-form-wrap">
                <csc-cf-add-form
                    ref="addCfForm"
                    :loading="$wait.is('csc-cf-mappings-full')"
                    @save="createCf($event)"
                    @cancel="disableCfAddForm"
                />
            </div>
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
                        :show-timeout-info="false"
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
                        :class="{ 'cf-group-disabled': !group.enabled }"
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
    name: 'CscCallForwardDetails',
    components: {
        CscPopupMenu,
        CscPopupMenuItem,
        CscPopupMenuRingTimeout,
        CscCfGroup,
        CscCfGroupItemPrimaryNumber,
        CscCfAddForm,
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
            'ringTimeout',
            'isCfAddFormDisabled'
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
        },
        isRingTimeoutVisible () {
            return this.ringTimeout && this.groups.some((group) => group.type === 'cft')
        }
    },
    async created () {
        await this.loadAnnouncements()
        await this.loadMappingsFull(this.id)
    },
    beforeUnmount () {
        this.disableCfAddForm()
        this.resetCallForwardingState()
    },
    methods: {
        ...mapActions('callForwarding', [
            'loadMappingsFull',
            'loadAnnouncements',
            'createMapping',
            'resetCallForwardingState'
        ]),
        ...mapMutations('callForwarding', [
            'enableCfAddForm',
            'disableCfAddForm'
        ]),
        async createCf (data) {
            await this.createMapping({ ...data, subscriberId: this.id })
            this.disableCfAddForm()
        }
    }
}
</script>
<style lang="sass" scoped>
.csc-cf-form-wrap
    width: 100%
    max-width: 800px

.cf-group-disabled
    opacity: 0.6
    filter: grayscale(30%)

    :deep(*)
        pointer-events: auto !important
        cursor: pointer !important
</style>
