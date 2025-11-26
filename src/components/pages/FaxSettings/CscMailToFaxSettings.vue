<template>
    <div>
        <q-list
            class="col col-xs-12 col-md-6"
            dense
        >
            <q-item>
                <q-item-section>
                    <q-toggle
                        :model-value="mailToFaxSettingsModel.active"
                        :label="$t('Active')"
                        :disable="disableToggle"
                        @update:model-value="setChangedData('active', !mailToFaxSettingsModel.active)"
                    />
                </q-item-section>
                <q-item-section
                    side
                >
                    <csc-spinner
                        v-if="loadingMail2FaxSettings"
                        class="self-center"
                    />
                </q-item-section>
            </q-item>
            <q-item>
                <q-item-section>
                    <csc-input-saveable
                        v-model.trim="mailToFaxSettingsModel.secret_key"
                        :label="secretKeyFieldLabel"
                        :disable="!dataLoaded"
                        :loading="loadingMail2FaxSettings"
                        :value-changed="mailToFaxSettingsModel.secret_key !== mailToFaxSettings.secret_key"
                        @save="setChangedData('secret_key', mailToFaxSettingsModel.secret_key)"
                        @undo="mailToFaxSettingsModel.secret_key = mailToFaxSettings.secret_key"
                    >
                        <csc-tooltip>
                            {{ $t('Enable strict mode that requires all mail2fax emails to have the secret key as the very first line of the email + an empty line. The key is removed from the email once matched.') }}
                        </csc-tooltip>
                    </csc-input-saveable>
                </q-item-section>
            </q-item>
            <q-item>
                <q-item-section>
                    <q-select
                        v-model="mailToFaxSettingsModel.secret_key_renew"
                        emit-value
                        map-options
                        :disable="!dataLoaded"
                        :readonly="!dataLoaded"
                        :label="$t('Secret Key Renew')"
                        :options="secretKeyRenewOptions"
                        @update:model-value="setChangedData('secret_key_renew', mailToFaxSettingsModel.secret_key_renew)"
                    >
                        <csc-tooltip>
                            {{ $t('Interval when the secret key is automatically renewed.') }}
                        </csc-tooltip>
                    </q-select>
                </q-item-section>
                <q-item-section
                    side
                >
                    <csc-spinner
                        v-if="loadingMail2FaxSettings"
                        class="self-center"
                    />
                </q-item-section>
            </q-item>
        </q-list>
        <div class="row">
            <div class="col q-py-md q-pl-md">
                <div class="row q-pb-xs">
                    <div class="col vertical-bottom">
                        <span class="vertical-middle">{{ $t('Secret Key Renew Notify') }}:</span>
                    </div>
                    <div class="col text-right">
                        <q-btn
                            flat
                            color="primary"
                            icon="add"
                            :disable="!dataLoaded || showAddNewRenewEmail"
                            @click="openAddNewRenewEmail"
                        >
                            {{ $t('Add email') }}
                        </q-btn>
                    </div>
                </div>
                <q-separator />
                <div class="col relative-position">
                    <div
                        v-if="showAddNewRenewEmail"
                        class="row justify-center q-pa-md"
                    >
                        <csc-mail-to-fax-renew-notify-email-form
                            v-if="showAddNewRenewEmail"
                            ref="addNewRenewEmailForm"
                            class="col"
                            :loading="!dataLoaded"
                            :is-add-new-mode="true"
                            @save="addNewRenewEmail"
                            @cancel="closeAddNewRenewEmail"
                        />
                    </div>
                    <div
                        v-if="!showAddNewRenewEmail && (!mailToFaxSettingsModel.secret_renew_notify || !mailToFaxSettingsModel.secret_renew_notify.length)"
                        class="row q-pa-md justify-center"
                    >
                        {{ $t('There are no Key Renew Notify Emails yet') }}
                    </div>
                    <div
                        v-else
                        class="row q-pa-xs"
                    >
                        <q-list class="col striped-list">
                            <csc-mail-to-fax-renew-notify-email
                                v-for="renewEmail in mailToFaxSettingsModel.secret_renew_notify"
                                :key="renewEmail.destination"
                                :value="renewEmail.destination"
                                @save="updateRenewEmailItem(renewEmail.destination, $event)"
                                @remove="deleteRenewEmailItem(renewEmail.destination)"
                            />
                        </q-list>
                    </div>

                    <q-inner-loading :showing="!dataLoaded">
                        <q-spinner-dots
                            size="50px"
                            color="primary"
                        />
                    </q-inner-loading>
                </div>
            </div>
            <div class="col q-pa-md">
                <div class="row q-pb-xs">
                    <div class="col">
                        {{ $t('ACL') }}:
                    </div>
                    <div class="col text-right">
                        <q-btn
                            flat
                            color="primary"
                            icon="add"
                            :disable="!dataLoaded || showAddNewACL"
                            @click="openAddNewACL"
                        >
                            {{ $t('Add ACL') }}
                        </q-btn>
                    </div>
                </div>
                <q-separator />
                <div class="col relative-position">
                    <div
                        v-if="showAddNewACL"
                        class="row justify-center q-pa-md"
                    >
                        <csc-mail-to-fax-a-c-l-form
                            v-if="showAddNewACL"
                            ref="addNewACLForm"
                            class="col"
                            :loading="!dataLoaded"
                            :is-add-new-mode="true"
                            @save="addNewACL"
                            @cancel="closeAddNewACL"
                        />
                    </div>
                    <div
                        v-if="!showAddNewACL && (!mailToFaxSettingsModel.acl || !mailToFaxSettingsModel.acl.length)"
                        class="row q-pa-md justify-center"
                    >
                        {{ $t('There are no ACLs yet') }}
                    </div>
                    <div
                        v-else
                        class="row q-pa-xs"
                    >
                        <q-list class="col striped-list">
                            <csc-mail-to-fax-a-c-l
                                v-for="(acl, index) in mailToFaxSettingsModel.acl"
                                :key="index"
                                :acl="acl"
                                :expanded="index === expandedACLId"
                                @expand="expandedACLId = index"
                                @collapse="expandedACLId = null"
                                @update-property="updateACL(index, $event)"
                                @remove="deleteACL(index)"
                            />
                        </q-list>
                    </div>

                    <q-inner-loading :showing="!dataLoaded">
                        <q-spinner-dots
                            size="50px"
                            color="primary"
                        />
                    </q-inner-loading>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import CscSpinner from 'components/CscSpinner'
import CscTooltip from 'components/CscTooltip'
import CscInputSaveable from 'components/form/CscInputSaveable'
import CscMailToFaxACL from 'components/pages/FaxSettings/CscMailToFaxACL'
import CscMailToFaxACLForm from 'components/pages/FaxSettings/CscMailToFaxACLForm'
import CscMailToFaxRenewNotifyEmail from 'components/pages/FaxSettings/CscMailToFaxRenewNotifyEmail'
import CscMailToFaxRenewNotifyEmailForm from 'components/pages/FaxSettings/CscMailToFaxRenewNotifyEmailForm'
import _ from 'lodash'
import { showGlobalError } from 'src/helpers/ui'
import { mapWaitingActions, mapWaitingGetters } from 'vue-wait-vue3'
import { mapGetters, mapState } from 'vuex'

export default {
    name: 'CscMailToFaxSettings',
    components: {
        CscTooltip,
        CscMailToFaxACLForm,
        CscMailToFaxRenewNotifyEmailForm,
        CscMailToFaxACL,
        CscMailToFaxRenewNotifyEmail,
        CscInputSaveable,
        CscSpinner
    },
    props: {
        id: {
            type: String,
            default: ''
        }
    },
    data () {
        return {
            mailToFaxSettingsModel: {},
            showAddNewRenewEmail: false,
            showAddNewACL: false,
            expandedACLId: null
        }
    },
    computed: {
        ...mapState('fax', [
            'mailToFaxSettings',
            'mailToFaxSettingsInitialized'
        ]),
        ...mapGetters('user', [
            'getSubscriber'
        ]),
        ...mapWaitingGetters({
            loadingMail2FaxSettings: 'loading mail2faxSettings'
        }),
        dataLoaded () {
            return this.mailToFaxSettingsInitialized && !this.loadingMail2FaxSettings
        },
        disableToggle () {
            if (!this.isAdministrator) {
                return true
            }
            return !this.dataLoaded
        },
        isAdministrator () {
            return this.getSubscriber?.administrative || false
        },
        secretKeyFieldLabel () {
            let label = this.$t('Secret Key (empty=disabled)')
            label += ` (${this.$t('Last Modify Time')}: `
            if (this.mailToFaxSettings.last_secret_key_modify) {
                label += `${this.mailToFaxSettings.last_secret_key_modify})`
            } else {
                label += `${this.$t('Not modified yet')})`
            }
            return label
        },
        secretKeyRenewOptions () {
            return [
                { value: 'never', label: this.$t('Never') },
                { value: 'daily', label: this.$t('Daily') },
                { value: 'weekly', label: this.$t('Weekly') },
                { value: 'monthly', label: this.$t('Monthly') }
            ]
        }
    },
    mounted () {
        this.loadMailToFaxSettings(this.id)
    },
    methods: {
        ...mapWaitingActions('fax', {
            loadMailToFaxSettingsAction: 'loading mail2faxSettings',
            mailToFaxSettingsUpdateAction: 'loading mail2faxSettings'
        }),
        async loadMailToFaxSettings () {
            try {
                await this.loadMailToFaxSettingsAction(this.id)
                this.updateDataFromStore()
            } catch (err) {
                if (String(err.code) === '403') {
                    this.mailToFaxSettingsModel = {
                        active: false
                    }
                } else {
                    showGlobalError(err?.message || this.$t('Unknown error'))
                }
            }
        },
        updateDataFromStore () {
            this.mailToFaxSettingsModel = {
                active: true,
                ..._.cloneDeep(this.mailToFaxSettings)
            }
        },
        async setChangedData (field, value, beforeUpdateUI = () => {}) {
            try {
                let newValue = value
                if (field === 'secret_key') {
                    newValue = newValue === '' ? null : newValue
                }
                await this.mailToFaxSettingsUpdateAction({ field, value: newValue, id: this.id })
                beforeUpdateUI()
                this.updateDataFromStore()
            } catch (err) {
                showGlobalError(err?.message || this.$t('Unknown error'))
            }
        },
        openAddNewRenewEmail () {
            this.showAddNewRenewEmail = true
        },
        closeAddNewRenewEmail () {
            this.showAddNewRenewEmail = false
            this.$refs.addNewRenewEmailForm.reset()
        },
        addNewRenewEmail (newItemData) {
            const renewEmailItems = [...this.mailToFaxSettingsModel.secret_renew_notify, newItemData]

            this.setChangedData('secret_renew_notify', renewEmailItems, () => {
                this.closeAddNewRenewEmail()
            })
        },
        updateRenewEmailItem (itemId, data) {
            const renewEmailItems = _.cloneDeep(this.mailToFaxSettingsModel.secret_renew_notify)
            const renewEmailItemIndex = renewEmailItems.findIndex((d) => d.destination === itemId)
            if (renewEmailItemIndex >= 0) {
                renewEmailItems[renewEmailItemIndex].destination = data.value
            }

            this.setChangedData('secret_renew_notify', renewEmailItems)
        },
        deleteRenewEmailItem (itemId) {
            const renewEmailItems = this.mailToFaxSettingsModel.secret_renew_notify.filter((d) => d.destination !== itemId)
            this.setChangedData('secret_renew_notify', renewEmailItems)
        },

        openAddNewACL () {
            this.showAddNewACL = true
        },
        closeAddNewACL () {
            this.showAddNewACL = false
            this.$refs.addNewACLForm.reset()
        },
        addNewACL (newItemData) {
            const ACLItems = [...this.mailToFaxSettingsModel.acl, newItemData]

            this.setChangedData('acl', ACLItems, () => {
                this.closeAddNewACL()
            })
        },
        updateACL (itemId, { name, value }) {
            const ACLItems = _.cloneDeep(this.mailToFaxSettingsModel.acl)
            if (itemId >= 0) {
                ACLItems[itemId][name] = value
            }

            this.setChangedData('acl', ACLItems)
        },
        deleteACL (itemId) {
            const ACLItems = this.mailToFaxSettingsModel.acl.filter((acl, index) => index !== itemId)
            this.setChangedData('acl', ACLItems, () => {
                this.expandedACLId = null
            })
        }
    }
}
</script>

<style lang="sass" rel="stylesheet/sass" scoped>

</style>
