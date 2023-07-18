<template>
    <div>
        <q-list
            class="col col-xs-12 col-md-6"
            dense
        >
            <q-item>
                <q-item-section>
                    <q-toggle
                        :model-value="faxToMailSettings.active"
                        :label="$t('Active')"
                        data-cy="faxtomail-enable"
                        :disable="!dataLoaded"
                        @update:model-value="setChangedData('active', !faxServerSettings.active)"
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
                        :label="$t('Name in Fax Header for Sendfax')"
                        data-cy="sendfax-faxheader-name"
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
                        :model-value="faxToMailSettings.t38"
                        :label="$t('T38')"
                        data-cy="faxtomail-t38"
                        :disable="!dataLoaded"
                        @update:model-value="setChangedData('t38', !faxServerSettings.t38)"
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
                        :model-value="faxToMailSettings.ecm"
                        :label="$t('ECM')"
                        data-cy="faxtomail-ecm"
                        :disable="!dataLoaded"
                        @update:model-value="setChangedData('ecm', !faxServerSettings.ecm)"
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
                    <span class="text-h6">{{ $t('Destinations') }}:</span>
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
                        data-cy="destination-add"
                        :disable="!dataLoaded || showAddNewDestination"
                        @click="openAddNewDestination"
                    >
                        {{ $t('Add destination') }}
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
                    <csc-fax-to-mail-destination-form
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
                    {{ $t('No destinations created yet') }}
                </q-item>
                <csc-fax-to-mail-destination
                    v-for="(destinationItem, index) in faxToMailSettings.destinations"
                    :key="destinationItem.destination"
                    :odd="(index % 2) === 0"
                    :expanded="expandedDestinationId === destinationItem.destination"
                    :destination="destinationItem"
                    :loading="loadingFaxServerSettings"
                    @collapse="expandedDestinationId = null"
                    @expand="expandedDestinationId = destinationItem.destination"
                    @remove="openDeleteDestinationDialog(destinationItem.destination)"
                    @update-property="updateDestinationItemProperty(destinationItem.destination, $event)"
                />
            </q-list>
        </div>
    </div>
</template>

<script>
import _ from 'lodash'
import { mapState } from 'vuex'
import CscInputSaveable from 'components/form/CscInputSaveable'
import CscSpinner from 'components/CscSpinner'
import { mapWaitingActions, mapWaitingGetters } from 'vue-wait'
import CscFaxToMailDestinationForm from 'components/pages/FaxSettings/CscFaxToMailDestinationForm'
import CscFaxToMailDestination from 'components/pages/FaxSettings/CscFaxToMailDestination'
import CscRemoveDialog from 'components/CscRemoveDialog'
import { showGlobalError } from 'src/helpers/ui'
export default {
    name: 'CscFaxToMailSettings',
    components: {
        CscFaxToMailDestination,
        CscFaxToMailDestinationForm,
        CscSpinner,
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
            faxServerSettingsUpdateAction: 'loading faxServerSettings'
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
                await this.faxServerSettingsUpdateAction({ field, value })
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
                await this.faxServerSettingsUpdateAction({
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
            this.faxServerSettingsUpdateAction({
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
                componentProps: {
                    title: this.$t('Remove Destination'),
                    message: this.$t('You are about to remove destination {destination}', { destination: destinationId })
                }
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
