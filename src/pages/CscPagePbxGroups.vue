<template>
	<csc-page
		class="q-pa-lg"
	>
		<csc-list-actions
			class="row justify-center q-mb-lg"
		>
			<csc-list-action-button
				v-if="isGroupAddFormDisabled"
				slot="slot1"
				icon="add"
				color="primary"
				:label="$t('pbxConfig.addGroup')"
				:disable="isGroupListRequesting"
				@click="enableGroupAddForm"
			/>
		</csc-list-actions>
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
					@save="createGroup"
					@cancel="disableGroupAddForm"
				/>
			</div>
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
		<csc-list
			v-if="!isGroupListEmpty && groupListVisibility === 'visible'"
		>
			<csc-fade
				v-for="(group, index) in groupListItems"
				:key="'csc-fade-' + group.id"
			>
				<csc-pbx-group
					:key="group.id"
					:odd="(index % 2) === 0"
					:group="group"
					:seats="seatMapById"
					:expanded="isGroupExpanded(group.id)"
					:loading="isGroupLoading(group.id)"
					:alias-number-options="getNumberOptions"
					:seat-options="getSeatOptions"
					:sound-set-options="getSoundSetOptions"
					:hunt-policy-options="getHuntPolicyOptions"
					:sound-set="getSoundSetByGroupId(group.id)"
					:label-width="4"
					:has-call-queue="hasCallQueue(group.id)"
					@expand="expandGroup(group.id)"
					@collapse="collapseGroup(group.id)"
					@remove="openGroupRemovalDialog(group.id)"
					@save-name="setGroupName"
					@save-extension="setGroupExtension"
					@save-hunt-policy="setGroupHuntPolicy"
					@save-hunt-timeout="setGroupHuntTimeout"
					@save-alias-numbers="setGroupNumbers"
					@save-seats="setGroupSeats"
					@save-sound-set="setGroupSoundSet"
					@jump-to-call-queue="jumpToCallQueue"
				/>
			</csc-fade>
		</csc-list>
		<div
			v-if="isGroupListEmpty && !isGroupListRequesting"
			class="row justify-center csc-no-entities"
		>
			{{ $t('pbxConfig.noGroups') }}
		</div>
		<csc-remove-dialog
			ref="removeDialog"
			:title="$t('pbxConfig.removeGroupTitle')"
			:message="getGroupRemoveDialogMessage"
			@remove="removeGroup({groupId:groupRemoving.id})"
			@cancel="closeGroupRemovalDialog"
		/>
	</csc-page>
</template>

<script>
import CscPage from 'components/CscPage'
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
import CscList from 'components/CscList'
import CscListSpinner from 'components/CscListSpinner'

export default {
	components: {
		CscListSpinner,
		CscFade,
		CscPage,
		CscPbxGroup,
		CscPbxGroupAddForm,
		CscRemoveDialog,
		CscList,
		CscListActions,
		CscListActionButton
	},
	mixins: [
		platform
	],
	data () {
		return {}
	},
	computed: {
		...mapState('pbx', [
			'seatMapById'
		]),
		...mapState('pbxGroups', [
			'groupListItems',
			'groupListCurrentPage',
			'groupListLastPage',
			'groupSelected',
			'groupCreating',
			'groupCreationState',
			'groupCreationError',
			'groupUpdating',
			'groupUpdateState',
			'groupUpdateError',
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
			'isGroupExpanded',
			'isGroupLoading',
			'getSoundSetByGroupId',
			'getGroupCreatingName',
			'getGroupUpdatingField',
			'getGroupRemovingName',
			'getGroupRemoveDialogMessage',
			'getGroupCreationToastMessage',
			'getGroupUpdateToastMessage',
			'getGroupRemovalToastMessage',
			'getHuntPolicyOptions',
			'hasCallQueue'
		])
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
		groupUpdateState (state) {
			if (state === RequestState.succeeded) {
				showToast(this.getGroupUpdateToastMessage)
			} else if (state === RequestState.failed) {
				showGlobalError(this.groupUpdateError)
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
		this.loadGroupListItems()
	},
	methods: {
		...mapActions('pbxGroups', [
			'loadGroupListItems',
			'createGroup',
			'removeGroup',
			'setGroupName',
			'setGroupExtension',
			'setGroupHuntPolicy',
			'setGroupHuntTimeout',
			'setGroupSeats',
			'setGroupNumbers',
			'setGroupSoundSet'
		]),
		...mapMutations('pbxGroups', [
			'enableGroupAddForm',
			'disableGroupAddForm',
			'expandGroup',
			'collapseGroup',
			'groupRemovalRequesting',
			'groupRemovalCanceled'
		]),
		...mapActions('pbxCallQueues', [
			'jumpToCallQueue'
		]),
		resetGroupAddForm () {
			if (this.$refs.addForm) {
				this.$refs.addForm.reset()
			}
		},
		openGroupRemovalDialog (groupId) {
			if (this.$refs.removeDialog) {
				this.groupRemovalRequesting(groupId)
				this.$refs.removeDialog.open()
			}
		},
		closeGroupRemovalDialog () {
			this.groupRemovalCanceled()
		},
		loadGroupListItemsPaginated (page) {
			this.$scrollTo(this.$parent.$el)
			this.loadGroupListItems({
				page: page
			})
		}
	}
}
</script>
