<template>
	<csc-page
		class="q-pa-lg"
	>
		<q-list
			class="col col-xs-12 col-md-6"
			dense
		>
			<q-item>
				<q-item-section>
					<q-toggle
						v-model="faxToMailSettings.active"
						:label="$t('faxSettings.active')"
						:disable="!dataLoaded"
						@input="setChangedData('active', !faxServerSettings.active)"
					/>
				</q-item-section>
				<q-item-section
					side
				>
					<csc-spinner
						v-if="loadingFaxServerSettings"
						class="self-center"
					/>
				</q-item-section>
			</q-item>
			<q-item>
				<q-item-section>
					<csc-input-saveable
						v-model.trim="faxToMailSettings.name"
						:label="$t('faxSettings.sendfaxHeaderName')"
						:disable="!dataLoaded"
						:loading="loadingFaxServerSettings"
						:value-changed="nameChanged"
						@save="setChangedData('name', faxToMailSettings.name)"
						@undo="restoreName"
					/>
				</q-item-section>
			</q-item>
			<q-item>
				<q-item-section>
					<q-toggle
						v-model="faxToMailSettings.t38"
						:label="$t('faxSettings.T38')"
						:disable="!dataLoaded"
						@input="setChangedData('t38', !faxServerSettings.t38)"
					/>
				</q-item-section>
				<q-item-section
					side
				>
					<csc-spinner
						v-if="loadingFaxServerSettings"
						class="self-center"
					/>
				</q-item-section>
			</q-item>
			<q-item>
				<q-item-section>
					<q-toggle
						v-model="faxToMailSettings.ecm"
						:label="$t('faxSettings.ECM')"
						:disable="!dataLoaded"
						@input="setChangedData('ecm', !faxServerSettings.ecm)"
					/>
				</q-item-section>
				<q-item-section
					side
				>
					<csc-spinner
						v-if="loadingFaxServerSettings"
						class="self-center"
					/>
				</q-item-section>
			</q-item>
			<q-item class="row">
				<div class="col">
					<span class="text-h6">Destinations:</span>
				</div>
				<div class="col text-center">
					<csc-spinner
						v-if="loadingFaxServerSettings"
					/>
				</div>
				<div class="col text-right">
					<q-btn
						flat
						color="primary"
						icon="add"
						:disable="!dataLoaded || showAddNewDestination"
						@click="openAddNewDestination"
					>
						{{ $t('faxSettings.addDestination') }}
					</q-btn>
				</div>
			</q-item>
		</q-list>
		<q-separator />
		<div
			class="row justify-center q-mb-lg"
		>
			<q-list
				class="col-xs-12"
			>
				<q-item
					v-if="showAddNewDestination"
					class="row justify-center"
				>
					<csc-fax2-mail-destination-form
						v-if="showAddNewDestination"
						ref="addNewDestination"
						:loading="loadingFaxServerSettings"
						:is-add-new-mode="true"
						@save="addNewDestination"
						@cancel="closeAddNewDestination"
					/>
				</q-item>
				<q-item
					v-if="!hasDestinations"
					class="row justify-center"
				>
					{{ $t('faxSettings.noDestinationsCreatedYet') }}
				</q-item>
				<csc-fax2-mail-destination
					v-for="(destinationItem, index) in faxToMailSettings.destinations"
					:key="destinationItem.destination"
					:odd="(index % 2) === 0"
					:expanded="expandedDestinationId === destinationItem.destination"
					:destination="destinationItem"
					:loading="loadingFaxServerSettings"
					@collapse="expandedDestinationId = null"
					@expand="expandedDestinationId = destinationItem.destination"
					@remove="openDeleteDestinationDialog(destinationItem.destination)"
					@update-property="updateDestinationItemProperty(destinationItem.destination, ...arguments)"
				/>
			</q-list>
		</div>
	</csc-page>
</template>

<script>
import _ from 'lodash'
import { mapState } from 'vuex'
import CscInputSaveable from 'components/form/CscInputSaveable'
import CscPage from 'components/CscPage'
import CscSpinner from 'components/CscSpinner'
import { mapWaitingActions, mapWaitingGetters } from 'vue-wait'
import CscFax2MailDestinationForm from 'components/pages/FaxSettings/CscFax2MailDestinationForm'
import CscFax2MailDestination from 'components/pages/FaxSettings/CscFax2MailDestination'
import CscRemoveDialog from 'components/CscRemoveDialog'
import { showGlobalError } from 'src/helpers/ui'
export default {
	name: 'CscPageFaxSettings',
	components: {
		CscFax2MailDestination,
		CscFax2MailDestinationForm,
		CscSpinner,
		CscPage,
		CscInputSaveable
	},
	data () {
		return {
			faxToMailSettings: {},
			showAddNewDestination: false,
			expandedDestinationId: null
		}
	},
	computed: {
		...mapState('fax', [
			'faxServerSettings',
			'faxServerSettingsInitialized'
		]),
		...mapWaitingGetters({
			loadingFaxServerSettings: 'loading faxServerSettings'
		}),
		dataLoaded () {
			return this.faxServerSettingsInitialized && !this.loadingFaxServerSettings
		},
		hasDestinations () {
			return this.faxToMailSettings?.destinations?.length
		},
		nameChanged () {
			return this.faxToMailSettings.name !== this.faxServerSettings.name
		}

	},
	mounted () {
		this.loadFaxServerSettings()
	},
	methods: {
		...mapWaitingActions('fax', {
			loadFaxSettingsAction: 'loading faxServerSettings',
			fieldUpdateAction: 'loading faxServerSettings'
		}),
		async loadFaxServerSettings () {
			try {
				await this.loadFaxSettingsAction()
				this.updateDataFromStore()
			} catch (err) {
				showGlobalError(err?.message)
			}
		},
		updateDataFromStore () {
			this.faxToMailSettings = _.cloneDeep(this.faxServerSettings)
		},
		async setChangedData (field, value) {
			try {
				await this.fieldUpdateAction({ field, value })
				this.updateDataFromStore()
			} catch (err) {
				showGlobalError(err?.message)
			}
		},
		restoreName () {
			this.faxToMailSettings.name = this.faxServerSettings.name
		},
		async updateDestinations (destinationItems, beforeUpdateUI = () => {}) {
			try {
				await this.fieldUpdateAction({
					field: 'destinations',
					value: destinationItems
				})
				beforeUpdateUI()
				this.updateDataFromStore()
			} catch (err) {
				showGlobalError(err?.message)
			}
		},
		openAddNewDestination () {
			this.showAddNewDestination = true
		},
		closeAddNewDestination () {
			this.showAddNewDestination = false
			this.$refs.addNewDestination.reset()
		},
		addNewDestination (destination) {
			const destinationItems = [...this.faxToMailSettings.destinations, destination]

			this.updateDestinations(destinationItems, () => {
				this.closeAddNewDestination()
			})
		},
		deleteDestination (destinationId) {
			const destinationItems = this.faxToMailSettings.destinations.filter(d => d.destination !== destinationId)
			this.fieldUpdateAction({
				field: 'destinations',
				value: destinationItems
			}).then(() => {
				if (this.expandedDestinationId === destinationId) {
					this.expandedDestinationId = null
				}
				this.updateDataFromStore()
			})
		},
		openDeleteDestinationDialog (destinationId) {
			this.$q.dialog({
				component: CscRemoveDialog,
				parent: this,
				title: this.$t('faxSettings.deleteDestinationTitle'),
				message: this.$t('faxSettings.deleteDestinationText', { destination: destinationId })
			}).onOk(() => {
				this.deleteDestination(destinationId)
			})
		},
		updateDestinationItemProperty (destinationId, data) {
			const destinationItems = _.cloneDeep(this.faxToMailSettings.destinations)
			const destinationItemIndex = destinationItems.findIndex(d => d.destination === destinationId)
			if (destinationItemIndex >= 0) {
				destinationItems[destinationItemIndex][data.name] = data.value
			}

			this.updateDestinations(destinationItems)
		}
	}
}
</script>
