<template>
    <csc-page
        id="csc-page-pbx-groups"
        class="q-pa-lg"
    >
        <csc-list-actions
            class="row justify-center q-mb-xs"
        >
            <template
                v-if="isGroupAddFormDisabled"
                #slot1
            >
                <csc-list-action-button
                    icon="add"
                    color="primary"
                    :label="$t('Add Group')"
                    :disable="isGroupListRequesting"
                    data-cy="groups-add-new"
                    @click="enableAddForm"
                />
            </template>
            <template
                #slot2
            >
                <csc-list-action-button
                    v-if="!filtersEnabled"
                    icon="filter_alt"
                    color="primary"
                    :label="$t('Filter groups')"
                    data-cy="groups-filter-open"
                    @click="enableFilters"
                />
                <csc-list-action-button
                    v-if="filtersEnabled"
                    icon="clear"
                    color="negative"
                    :label="$t('Close filters')"
                    data-cy="groups-filter-close"
                    @click="closeFilters"
                />
            </template>
        </csc-list-actions>
        <q-separator class="q-mb-xs" />
        <q-slide-transition>
            <div
                v-if="!isGroupAddFormDisabled"
                class="row justify-center q-mb-lg"
            >
                <csc-pbx-group-add-form
                    ref="addForm"
                    class="col-xs-12"
                    :loading="isGroupCreating"
                    :seat-options="getSeatOptions"
                    :alias-number-options="getNumberOptions"
                    :sound-set-options="getSoundSetOptions"
                    :hunt-policy-options="getHuntPolicyOptions"
                    :hunt-cancel-mode-options="getHuntCancelModeOptions"
                    @save="createGroup"
                    @cancel="disableGroupAddForm"
                />
            </div>
        </q-slide-transition>
        <q-slide-transition>
            <CscPbxGroupFilters
                v-if="hasFilters || filtersEnabled"
                :loading="isGroupListRequesting"
                class="q-pb-md"
                @filter="applyFilter"
            />
        </q-slide-transition>
        <div
            v-if="isGroupListPaginationActive"
            class="row justify-center"
        >
            <q-pagination
                :value="groupListCurrentPage"
                :max="groupListLastPage"
                @input="loadGroupListItemsPaginated"
            />
        </div>
        <csc-list-spinner
            v-if="isGroupListRequesting && !(isGroupCreating || isGroupRemoving || isGroupUpdating)"
        />
        <q-list
            v-if="!isGroupListEmpty && groupListVisibility === 'visible'"
            class="row justify-start items-start"
        >
            <csc-fade
                v-for="(group, index) in groupListItems"
                :key="'csc-fade-' + group.id"
            >
                <csc-pbx-group
                    :key="group.id"
                    :class="'col-xs-12 col-md-6 col-lg-4 csc-item-' + ((index % 2 === 0)?'odd':'even')"
                    :odd="(index % 2) === 0"
                    :group="group"
                    :seats="seatMapById"
                    :loading="isGroupLoading(group.id)"
                    :hunt-policy-options="getHuntPolicyOptions"
                    :hunt-cancel-mode-options="getHuntCancelModeOptions"
                    :label-width="4"
                    @remove="openGroupRemovalDialog(group.id)"
                />
            </csc-fade>
        </q-list>
        <div
            v-if="isGroupListEmpty && !isGroupListRequesting && hasFilters"
            class="row justify-center csc-no-entities"
        >
            {{ $t('Could not find any group matching any of the filter criteria') }}
        </div>
        <div
            v-else-if="isGroupListEmpty && !isGroupListRequesting"
            class="row justify-center csc-no-entities"
        >
            {{ $t('No groups created yet') }}
        </div>
        <csc-remove-dialog
            ref="removeDialog"
            :title="$t('Remove group')"
            :message="getGroupRemoveDialogMessage"
            @remove="removeGroup({groupId:groupRemoving.id})"
            @cancel="closeGroupRemovalDialog"
        />
    </csc-page>
</template>

<script>
import CscPage from 'components/CscPage'
import CscPbxGroupFilters from 'components/pages/PbxConfiguration/CscPbxGroupFilters'
import CscPbxGroupAddForm from 'components/pages/PbxConfiguration/CscPbxGroupAddForm'
import CscPbxGroup from 'components/pages/PbxConfiguration/CscPbxGroup'
import CscRemoveDialog from 'components/CscRemoveDialog'
import CscListActions from 'components/CscListActions'
import CscListActionButton from 'components/CscListActionButton'
import {
    mapState,
    mapGetters,
    mapActions,
    mapMutations
} from 'vuex'
import {
    showGlobalError,
    showToast
} from 'src/helpers/ui'
import {
    CreationState,
    RequestState
} from 'src/store/common'
import platform from 'src/mixins/platform'
import CscFade from 'components/transitions/CscFade'
import CscListSpinner from 'components/CscListSpinner'

export default {
    name: 'CscPagePbxGroups',
    components: {
        CscListSpinner,
        CscFade,
        CscPage,
        CscPbxGroup,
        CscPbxGroupFilters,
        CscPbxGroupAddForm,
        CscRemoveDialog,
        CscListActions,
        CscListActionButton
    },
    mixins: [
        platform
    ],
    data () {
        return {
            filters: {},
            filtersEnabled: false
        }
    },
    computed: {
        ...mapState('pbx', [
            'seatMapById'
        ]),
        ...mapState('pbxGroups', [
            'groupListItems',
            'groupListCurrentPage',
            'groupListLastPage',
            'groupCreating',
            'groupCreationState',
            'groupCreationError',
            'groupRemoving',
            'groupRemovalState',
            'groupRemovalError',
            'groupListVisibility'
        ]),
        ...mapGetters('pbx', [
            'getNumberOptions',
            'getSoundSetOptions',
            'getSeatOptions'
        ]),
        ...mapGetters('pbxGroups', [
            'isGroupListEmpty',
            'isGroupListRequesting',
            'isGroupListPaginationActive',
            'isGroupAddFormDisabled',
            'isGroupCreating',
            'isGroupUpdating',
            'isGroupRemoving',
            'isGroupLoading',
            'getGroupRemoveDialogMessage',
            'getGroupCreationToastMessage',
            'getGroupRemovalToastMessage',
            'getHuntPolicyOptions',
            'getHuntCancelModeOptions'
        ]),
        hasFilters () {
            return Object.keys(this.filters).length > 0
        }
    },

    watch: {
        groupCreationState (state) {
            if (state === CreationState.created) {
                this.resetGroupAddForm()
                this.$scrollTo(this.$parent.$el)
                showToast(this.getGroupCreationToastMessage)
            } else if (state === CreationState.error) {
                showGlobalError(this.groupCreationError)
            }
        },
        groupRemovalState (state) {
            if (state === RequestState.succeeded) {
                this.$scrollTo(this.$parent.$el)
                showToast(this.getGroupRemovalToastMessage)
            } else if (state === RequestState.failed) {
                showGlobalError(this.groupRemovalError)
            }
        }
    },
    mounted () {
        this.$scrollTo(this.$parent.$el)
        this.disableGroupAddForm()
        this.loadGroups()
    },
    methods: {
        ...mapActions('pbxGroups', [
            'loadGroupListItems',
            'createGroup',
            'removeGroup'
        ]),
        ...mapMutations('pbxGroups', [
            'enableGroupAddForm',
            'disableGroupAddForm',
            'groupRemovalRequesting',
            'groupRemovalCanceled'
        ]),
        loadGroups (page) {
            this.loadGroupListItems({
                page: page,
                filters: this.filters
            })
        },
        resetGroupAddForm () {
            if (this.$refs.addForm) {
                this.$refs.addForm.reset()
            }
        },
        enableAddForm () {
            this.closeFilters()
            this.enableGroupAddForm()
        },
        enableFilters () {
            this.filtersEnabled = true
            this.disableGroupAddForm()
        },
        applyFilter (filterData) {
            this.filters = filterData
            this.loadGroups(1)
        },
        resetFilters () {
            if (this.hasFilters) {
                this.filters = []
                this.loadGroups(1)
            }
        },
        closeFilters () {
            this.filtersEnabled = false
            this.resetFilters()
        },

        openGroupRemovalDialog (groupId) {
            if (this.$refs.removeDialog) {
                this.groupRemovalRequesting(groupId)
                this.$refs.removeDialog.show()
            }
        },
        closeGroupRemovalDialog () {
            this.groupRemovalCanceled()
        },
        loadGroupListItemsPaginated (page) {
            this.$scrollTo(this.$parent.$el)
            this.loadGroups(page)
        }
    }
}
</script>
