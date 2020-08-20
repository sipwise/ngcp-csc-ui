<template>
	<csc-page
		class="q-pa-lg"
	>
		<csc-list-actions
			class="row justify-center q-mb-lg"
		>
			<csc-list-action-button
				v-if="!isMsConfigAddFormEnabled"
				slot="slot1"
				icon="add"
				color="primary"
				:label="$t('pbxConfig.msConfigCreationIndicationLabel')"
				@click="enableMsConfigAddForm"
			/>
		</csc-list-actions>
		<q-slide-transition>
			<div
				v-if="isMsConfigAddFormEnabled"
				class="row justify-center"
			>
				<csc-pbx-ms-config-add-form
					class="csc-list-form col-xs-12 col-md-6"
					:loading="isMsConfigCreating"
					:subscriber-options="getSubscriberOptions"
					:subscriber-options-loading="isSubscribersRequesting"
					:number-options="getFullNumberOptions"
					:numbers-options-loading="isNumbersRequesting"
					@cancel="disableMsConfigAddForm"
					@submit="createMsConfig"
					@ready="addFormReady"
				/>
			</div>
		</q-slide-transition>
		<csc-list-spinner
			v-if="isMsConfigListRequesting && !msConfigListVisible"
		/>
		<csc-list
			v-if="!isMsConfigListRequesting || msConfigListVisible"
		>
			<csc-fade
				v-for="(msConfig, index) in msConfigList"
				:key="'csc-fade-'+msConfig.id"
			>
				<csc-pbx-ms-config
					:key="msConfig.id"
					:odd="(index % 2) === 0"
					:loading="isMsConfigLoading(msConfig.id)"
					:expanded="isMsConfigExpanded(msConfig.id)"
					:ms-config="msConfig"
					:subscriber="subscriberMap[msConfig.id]"
					:number-options="getFullNumberOptions"
					:numbers-options-loading="isNumbersRequesting"
					@remove="openMsConfigRemovalDialog"
					@expand="expandMsConfig(msConfig.id)"
					@collapse="collapseMsConfig"
					@ready="addFormReady"
					@save-secretary-numbers="setSecretaryNumbers"
				/>
			</csc-fade>
		</csc-list>
		<div
			v-if="isMsConfigListEmpty && !isMsConfigListRequesting"
			class="row justify-center csc-no-entities"
		>
			{{ $t('pbxConfig.noMsConfigs') }}
		</div>
		<csc-remove-dialog
			ref="removeDialog"
			:title="$t('pbxConfig.msConfigRemovalDialogTitle')"
			:message="getMsConfigRemoveDialogMessage"
			@remove="removeMsConfig"
			@cancel="closeMsConfigRemovalDialog"
		/>
	</csc-page>
</template>

<script>
import {
	mapState,
	mapActions,
	mapGetters,
	mapMutations
} from 'vuex'
import {
	CreationState,
	RequestState
} from 'src/store/common'
import {
	showGlobalError,
	showToast
} from 'src/helpers/ui'
import CscPage from '../../CscPage'
import CscPbxMsConfig from './CscPbxMsConfig'
import CscPbxMsConfigAddForm from './CscPbxMsConfigAddForm'
import CscRemoveDialog from '../../CscRemoveDialog'
import CscListSpinner from '../../CscListSpinner'
import CscListActions from '../../CscListActions'
import CscList from '../../CscList'
import CscFade from '../../transitions/CscFade'
import CscListActionButton from '../../CscListActionButton'

export default {
	components: {
		CscListActionButton,
		CscFade,
		CscList,
		CscPage,
		CscPbxMsConfig,
		CscPbxMsConfigAddForm,
		CscRemoveDialog,
		CscListSpinner,
		CscListActions
	},
	data () {
		return {
		}
	},
	computed: {
		...mapGetters('pbx', [
			'isSubscribersRequesting',
			'getSubscriberOptions',
			'isNumbersRequesting',
			'getFullNumberOptions'
		]),
		...mapState('pbxMsConfigs', [
			'msConfigList',
			'msConfigListVisible',
			'subscriberMap',
			'msConfigCreationState',
			'msConfigUpdateState',
			'msConfigRemovalState',
			'msConfigCreationError',
			'msConfigUpdateError',
			'msConfigRemovalError'
		]),
		...mapGetters('pbxMsConfigs', [
			'isMsConfigListEmpty',
			'isMsConfigListRequesting',
			'isMsConfigAddFormEnabled',
			'isMsConfigCreating',
			'getMsConfigRemoveDialogMessage',
			'isMsConfigLoading',
			'isMsConfigExpanded',
			'getMsConfigCreationToastMessage',
			'getMsConfigUpdateToastMessage',
			'getMsConfigRemovalToastMessage'
		])
	},
	watch: {
		msConfigCreationState (state) {
			if (state === CreationState.created) {
				this.$scrollTo(this.$parent.$el)
				showToast(this.getMsConfigCreationToastMessage)
			} else if (state === CreationState.error) {
				showGlobalError(this.msConfigCreationError)
			}
		},
		msConfigUpdateState (state) {
			if (state === RequestState.succeeded) {
				showToast(this.getMsConfigUpdateToastMessage)
			} else if (state === RequestState.failed) {
				showGlobalError(this.msConfigUpdateError)
			}
		},
		msConfigRemovalState (state) {
			if (state === RequestState.succeeded) {
				this.$scrollTo(this.$parent.$el)
				showToast(this.getMsConfigRemovalToastMessage)
			} else if (state === RequestState.failed) {
				showGlobalError(this.msConfigRemovalError)
			}
		}
	},
	mounted () {
		this.loadMsConfigList()
	},
	methods: {
		...mapActions('pbx', [
			'loadSubscribers',
			'loadNumbers'
		]),
		...mapMutations('pbxMsConfigs', [
			'enableMsConfigAddForm',
			'disableMsConfigAddForm',
			'msConfigRemovalRequesting',
			'msConfigRemovalCanceled',
			'expandMsConfig',
			'collapseMsConfig'
		]),
		...mapActions('pbxMsConfigs', [
			'loadMsConfigList',
			'createMsConfig',
			'removeMsConfig',
			'setSecretaryNumbers'
		]),
		openMsConfigRemovalDialog (msConfigId) {
			if (this.$refs.removeDialog) {
				this.$refs.removeDialog.open()
			}
			this.msConfigRemovalRequesting(msConfigId)
		},
		closeMsConfigRemovalDialog () {
			if (this.$refs.removeDialog) {
				this.$refs.removeDialog.close()
			}
			this.msConfigRemovalCanceled()
		},
		addFormReady () {
			this.loadSubscribers()
			this.loadNumbers()
		}
	}
}
</script>
