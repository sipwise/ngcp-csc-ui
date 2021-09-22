<template>
    <csc-page
        id="csc-page-voicebox"
        class="row q-pa-lg"
    >
        <q-list
            class="col col-xs-12 col-md-6"
        >
            <q-toggle
                v-model="manager_secretary"
                :label="$t('Manager Secretary feature')"
                :disable="isNumbersRequesting || isLoading"
                @input="addOrRemoveMs()"
            />
            <csc-spinner
                v-if="isLoading || !msConfig || !changes"
                class="q-ml-xl"
            />
            <q-item v-if="msConfig && changes">
                <q-item-section>
                    <q-select
                        v-model="changes.secretaryNumbers"
                        emit-value
                        map-options
                        multiple
                        chips
                        :disable="isNumbersRequesting || isLoading || !manager_secretary"
                        :label="$t('Select secretary numbers')"
                        :options="getFullNumberOptions"
                    >
                        <template
                            v-if="hasSecretaryNumbersChanged"
                            v-slot:append
                        >
                            <csc-input-button-save
                                @click.stop="save"
                            />
                            <csc-input-button-reset
                                @click.stop="resetMsConfig"
                            />
                        </template>
                    </q-select>
                </q-item-section>
            </q-item>
        </q-list>
    </csc-page>
</template>

<script>
import _ from 'lodash'
import {
    mapGetters,
    mapState
} from 'vuex'
import { mapWaitingActions } from 'vue-wait'
import CscPage from 'components/CscPage'
import CscInputButtonSave from 'components/form/CscInputButtonSave'
import CscInputButtonReset from 'components/form/CscInputButtonReset'
import CscSpinner from 'components/CscSpinner'
import { getSubscriberId } from 'src/auth'
import {
    showToast
} from 'src/helpers/ui'
export default {
    name: 'CscPagePbxSettingsMsConfigs',
    components: {
        CscPage,
        CscInputButtonSave,
        CscInputButtonReset,
        CscSpinner
    },
    data () {
        return {
            msConfig: null,
            changes: null,
            manager_secretary: false
        }
    },
    computed: {
        ...mapGetters('pbx', [
            'isNumbersRequesting',
            'getFullNumberOptions'
        ]),
        ...mapState('callSettings', [
            'subscriberPreferences'
        ]),
        ...mapGetters('user', [
            'getUsername'
        ]),
        hasSecretaryNumbersChanged () {
            const changedSecretaryNumbers = _.clone(_.get(this.changes, 'secretaryNumbers', []))
            const currentSecretaryNumbers = _.clone(this.msConfig.secretary_numbers)
            return !_.isEqual(changedSecretaryNumbers.sort(), currentSecretaryNumbers.sort())
        },
        isLoading () {
            return this.$wait.is('csc-pbx-manager-secretary-numbers') || this.$wait.is('csc-pbx-call-settings-load-preferences') ||
                this.$wait.is('csc-pbx-call-settings-update-preferences')
        }
    },
    async mounted () {
        await this.loadSubscriberPreferencesAction()
        await this.loadNumbers()
        this.getMsConfig()
        this.changes = this.getDefaultData()
    },
    methods: {
        ...mapWaitingActions('pbx', {
            loadNumbers: 'csc-pbx-manager-secretary-numbers'
        }),
        ...mapWaitingActions('callSettings', {
            loadSubscriberPreferencesAction: 'csc-pbx-call-settings-load-preferences',
            fieldUpdateAction: 'csc-pbx-call-settings-update-preferences'
        }),
        resetMsConfig () {
            this.changes = this.getDefaultData()
        },
        getDefaultData () {
            return {
                secretaryNumbers: _.clone(_.get(this.msConfig, 'secretary_numbers', []))
            }
        },
        async save () {
            if (this.hasSecretaryNumbersChanged) {
                await this.fieldUpdateAction({ field: 'secretary_numbers', value: this.changes.secretaryNumbers })
                this.getMsConfig()
                this.changes = this.getDefaultData()
                showToast(this.$t('Updated {field} for manager secretary config {msConfig} successfully', {
                    msConfig: this.getUsername,
                    field: 'secretaryNumbers'
                }))
            }
        },
        async getMsConfig () {
            this.msConfig = {
                id: this.subscriberPreferences.id,
                secretary_numbers: this.subscriberPreferences.secretary_numbers || [],
                subscriber_id: getSubscriberId()
            }
            this.manager_secretary = this.subscriberPreferences.manager_secretary ? this.subscriberPreferences.manager_secretary : this.manager_secretary
        },
        async addOrRemoveMs () {
            await this.fieldUpdateAction({ field: 'manager_secretary', value: this.manager_secretary })
        }
    }
}
</script>
