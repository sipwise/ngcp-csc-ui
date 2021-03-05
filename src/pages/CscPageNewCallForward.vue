<template>
    <csc-page
        id="csc-page-new-call-forward"
        class="q-pa-lg"
    >
        <div
            class="row q-mb-lg"
        >
            <div
                v-if="groupsCount > 0"
                class="col-xs-4 col-md-4 text-right"
            >
                {{ $t('Primary number {number} rings before forwarded if the user is available', {number: subscriberDisplayName}) }}
            </div>
            <div
                v-else
                class="col-xs-4 col-md-4 text-right"
            >
                {{ $t('All calls go to the primary number') }} {{ subscriberDisplayName }}
            </div>
            <div
                class="col-xs-2 col-md-2 text-left csc-cf-self-number-cont"
            >
                <q-toggle
                    v-if="groups.length > 0"
                    v-model="toggleDefaultNumber"
                    @input="toggleChange"
                />
            </div>
            <div
                class="col-xs-6 col-md-6"
            />
        </div>
        <div
            v-for="forwardGroup in groups"
            :key="forwardGroup.id"
            class="row q-mb-lg"
        >
            <csc-cf-group
                v-if="!groupInCreation"
                :group="forwardGroup"
                :toggle-default-number="toggleDefaultNumber"
            />
        </div>
        <div class="row q-mb-md">
            <div
                class="col-xs-4 col-md-4 text-right"
            >
                <q-spinner-dots
                    v-if="groupsLoading"
                    class="q-ml-auto"
                    color="primary"
                    :size="24"
                />
            </div>
        </div>
        <div
            v-if="!groupsLoading"
            class="row q-mb-lg"
        >
            <div
                v-if="!groupsLoading"
                class="col-xs-4 col-md-4"
            >
                <q-btn
                    flat
                    color="primary"
                    class="csc-cf-add-forwarding-btn"
                >
                    <q-icon
                        name="add"
                        size="24px"
                    />
                    {{ $t('Add forwarding') }}
                    <q-menu
                        ref="destsetTypeForm"
                        :auto-close="true"
                        class="cf-popover-bottom"
                        @show="resetSelectFwdGroup()"
                        @hide="addForwardGroup()"
                    >
                        <csc-new-call-forward-destinationset-type-select
                            ref="destsetTypeForm"
                        />
                    </q-menu>
                </q-btn>
                <q-spinner-dots
                    v-if="groupInCreation"
                    color="primary"
                    :size="24"
                />
            </div>
        </div>
    </csc-page>
</template>

<script>
import {
    mapGetters
} from 'vuex'
import {
    showGlobalWarning
} from 'src/helpers/ui'
import CscPage from 'components/CscPage'
import CscNewCallForwardDestinationsetTypeSelect from 'components/pages/NewCallForward/CscNewCallForwardDestinationsetTypeSelect'
import CscCfGroup from 'components/pages/NewCallForward/CscCallForwardGroup'
export default {
    components: {
        CscCfGroup,
        CscPage,
        CscNewCallForwardDestinationsetTypeSelect
    },
    data () {
        return {
            groups: [],
            // TODO move to store
            groupInCreation: false,
            groupsLoading: false,
            //
            toggleDefaultNumber: true
        }
    },
    computed: {
        ...mapGetters('newCallForward', [
            'subscriberDisplayName',
            'forwardGroups',
            'selectedDestType'
        ]),
        groupsCount () {
            return this.groups.length
        }
    },
    watch: {
        forwardGroups () {
            this.groups = this.forwardGroups
        }
    },
    async mounted () {
        this.groupsLoading = true
        this.$store.dispatch('newCallForward/loadMappings')
        // waits for the groups to be available
        await this.$store.dispatch('newCallForward/loadForwardGroups')
        const unconditionalGroups = await this.$store.dispatch('newCallForward/getForwardGroupByName', 'unconditional')
        this.toggleDefaultNumber = !unconditionalGroups
        this.$store.dispatch('newCallForward/loadSourcesets')
        this.$store.dispatch('newCallForward/loadTimesets')
        this.groupsLoading = false
    },
    methods: {
        async addForwardGroup () {
            this.groupInCreation = true
            const selectedDestType = this.selectedDestType
            const tempGroups = this.groups.filter(($group) => {
                return $group.id.toString().indexOf('temp-') > -1
            })
            if (tempGroups.length > 0) {
                showGlobalWarning(`${this.$t('You have to add a destination to the unsaved group')}`, 5000)
            } else {
                switch (selectedDestType) {
                case 'unconditional':
                    if (this.toggleDefaultNumber) {
                        const tempTimeoutFwdGroup = await this.$store.dispatch('newCallForward/getForwardGroupById', 'temp-csc-timeout')
                        if (!tempTimeoutFwdGroup) {
                            this.$store.dispatch('newCallForward/addTempGroup', 'timeout')
                        }
                    } else {
                        const tempUnconditionalFwdGroup = await this.$store.dispatch('newCallForward/getForwardGroupById', 'temp-csc-unconditional')
                        if (!tempUnconditionalFwdGroup) {
                            this.$store.dispatch('newCallForward/addTempGroup', 'unconditional')
                        }
                    }
                    break
                case 'unconditional-from':
                    if (this.toggleDefaultNumber) {
                        const tempTimeoutFwdGroup = await this.$store.dispatch('newCallForward/getForwardGroupById', 'temp-csc-timeout-from')
                        if (!tempTimeoutFwdGroup) {
                            this.$store.dispatch('newCallForward/addTempGroup', 'timeoutFrom')
                        }
                    } else {
                        const tempUnconditionalFwdGroup = await this.$store.dispatch('newCallForward/getForwardGroupById', 'temp-csc-unconditional-from')
                        if (!tempUnconditionalFwdGroup) {
                            this.$store.dispatch('newCallForward/addTempGroup', 'unconditionalFrom')
                        }
                    }
                    break
                case 'offline':
                    this.$store.dispatch('newCallForward/addTempGroup', 'offline')
                    break
                case 'busy':
                    this.$store.dispatch('newCallForward/addTempGroup', 'busy')
                    break
                }
            }
            this.groupInCreation = false
        },
        toggleChange () {
            this.groupInCreation = true
            this.$store.dispatch('newCallForward/forwardAllCalls', !this.toggleDefaultNumber)
            this.groupInCreation = false
        },
        resetSelectFwdGroup () {
            this.$store.dispatch('newCallForward/setSelectedDestType', null)
        }
    }
}
</script>

<style lang="stylus" rel="stylesheet/stylus">
        .csc-cf-add-forwarding-btn
                float right
    .csc-cf-self-number-cont
        padding-left 30px
        width 150px
        white-space nowrap
        overflow hidden
        text-overflow ellipsis
    .cf-popover-bottom
        min-width 150px
        margin-left 5px
        .csc-actions-cont
                margin-top 10px

</style>
