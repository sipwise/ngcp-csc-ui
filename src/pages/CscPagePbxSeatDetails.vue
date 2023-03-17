<template>
    <csc-page-sticky-tabs
        id="csc-page-pbx-seats-details"
        ref="pageSticky"
        :value="selectedTab"
    >
        <template
            v-slot:tabs
        >
            <q-breadcrumbs
                v-if="seatSelected"
                class="q-item absolute absolute-left text-weight-light"
                active-color="primary"
                separator-color="primary"
                >
                <q-breadcrumbs-el
                    key="seats"
                    class="cursor-pointer"
                    to="/user/pbx-configuration/seats"
                    :label="$t('Seats')"
                    icon="person"
                />
                <q-breadcrumbs-el
                    key="seat"
                    :label="(seatSelected.display_name) ? seatSelected.display_name : seatSelected.username"
                />
            </q-breadcrumbs>

            <q-tab
                v-for="tab in tabs"
                class="d-flex justify-content-center"
                :key="tab.value"
                :name="tab.value"
                :icon="tab.icon"
                :label="tab.label"
                :default="tab.value === selectedTab"
                @click="selectTab(tab.value)"
            />
        </template>

        <q-item
            class="col col-xs-12 col-md-6"
            v-if="selectedTab === 'preferences'"
        >

            <q-list
                v-if="changes"
                class="col col-xs-12 col-md-6"
                side
                top
                no-wrap
            >
                <csc-change-password-dialog
                    ref="changePasswordDialog"
                    @change-password="changeWebPassword({ password: $event.password })"
                />
                <q-input
                    v-model="changes.displayName"
                    :label="$t('Display Name')"
                    :disable="isLoading"
                    :error="$v.changes.displayName.$error"
                    :error-message="seatDisplayNameErrorMessage"
                    @input="$v.changes.displayName.$touch"
                    @keyup.enter="save"
                >
                    <template
                        v-if="hasDisplayNameChanged"
                        v-slot:append
                    >
                        <csc-input-button-save
                            v-if="!$v.changes.displayName.$error"
                            @click.stop="save"
                        />
                        <csc-input-button-reset
                            @click.stop="resetDisplayName"
                        />
                    </template>
                </q-input>
                <q-input
                    readonly
                    disable
                    :label="$t('SIP Username')"
                    :value="changes.sipUsername"
                />
                <q-input
                    v-model="changes.webUsername"
                    :label="$t('Web Username')"
                    :disable="isLoading"
                    :error="$v.changes.webUsername.$error"
                    :error-message="seatWebUsernameErrorMessage"
                    @input="$v.changes.webUsername.$touch"
                    @keyup.enter="save"
                >
                    <template
                        v-if="hasWebUsernameChanged"
                        v-slot:append
                    >
                        <csc-input-button-save
                            v-if="!$v.changes.webUsername.$error"
                            @click.stop="save"
                        />
                        <csc-input-button-reset
                            @click.stop="resetWebUsername"
                        />
                    </template>
                </q-input>
                <q-input
                    v-model="changes.extension"
                    hide-hint
                    :error="$v.changes.extension.$error"
                    :error-message="extensionErrorMessage"
                    :label="$t('Extension')"
                    :hint="getExtensionHint"
                    :disable="isLoading"
                    @keyup.enter="save"
                    @input="$v.changes.extension.$touch"
                >
                    <template
                        v-if="hasExtensionChanged"
                        v-slot:append
                    >
                        <csc-input-button-save
                            v-if="!$v.changes.webUsername.$error"
                            @click.stop="save"
                        />
                        <csc-input-button-reset
                            @click.stop="resetExtension"
                        />
                    </template>
                </q-input>
                <q-input
                    readonly
                    disable
                    :label="$t('Primary Number')"
                    :value="getPrimaryNumber"
                />
                <q-select
                    v-model="changes.aliasNumbers"
                    use-chips
                    multiple
                    emit-value
                    map-options
                    :options="getNumberOptions"
                    :disable="isLoading"
                    :label="$t('Alias Numbers')"
                >
                    <template
                        v-slot:append
                    >
                        <csc-input-button-save
                            v-if="hasAliasNumbersChanged"
                            @click.stop="save"
                        />
                        <csc-input-button-reset
                            v-if="hasAliasNumbersChanged"
                            @click.stop="resetAliasNumbers"
                        />
                    </template>
                </q-select>
                <q-select
                    v-model="changes.cliNumber"
                    emit-value
                    map-options
                    :options="getCliNumbersOptions"
                    :disable="isLoading"
                    :label="$t('CLI')"
                >
                    <template
                        v-slot:append
                    >
                        <csc-input-button-save
                            v-if="hasCliNumberChanged"
                            @click.stop="save"
                        />
                        <csc-input-button-reset
                            v-if="hasCliNumberChanged"
                            @click.stop="resetCliNumber"
                        />
                    </template>
                </q-select>
                <q-select
                    v-model="changes.groups"
                    use-chips
                    multiple
                    emit-value
                    map-options
                    :disable="isLoading"
                    :options="getGroupOptions"
                    :label="$t('Groups')"
                >
                    <template
                        v-slot:append
                    >
                        <csc-input-button-save
                            v-if="hasGroupsChanged"
                            @click.stop="save"
                        />
                        <csc-input-button-reset
                            v-if="hasGroupsChanged"
                            @click.stop="resetGroups"
                        />
                    </template>
                </q-select>
                <q-select
                    v-model="changes.soundSet"
                    radio
                    emit-value
                    map-options
                    :disable="isLoading"
                    :options="internalSoundSetOptions"
                    :label="$t('Sound Set')"
                >
                    <template
                        v-slot:append
                    >
                        <csc-input-button-save
                            v-if="hasSoundSetChanged"
                            @click.stop="save"
                        />
                        <csc-input-button-reset
                            v-if="hasSoundSetChanged"
                            @click.stop="resetSoundSet"
                        />
                    </template>
                </q-select>
                <q-toggle
                    v-model="changes.clirIntrapbx"
                    class="q-pa-sm"
                    :label="$t('Hide number within own PBX')"
                    :disable="isLoading"
                    @input="changeIntraPbx"
                />
                <q-btn
                    v-if="hasCallQueue(seatSelected.id)"
                    icon="filter_none"
                    flat
                    color="primary"
                    :label="$t('Call Queue')"
                    :disable="isLoading"
                    @click="goToCallQueue"
                />
                <q-toggle
                    v-model="changes.musicOnHold"
                    class="q-pa-sm"
                    :label="$t('Music on hold')"
                    :disable="isLoading"
                    @input="changeMusicOnHold"
                />
            </q-list>
        </q-item>

        <csc-call-forward-details
            v-else
            :id="id"/>
        
    </csc-page-sticky-tabs>
</template>

<script>
import _ from 'lodash'
import {
    showGlobalError,
    showToast
} from 'src/helpers/ui'
import {
    RequestState
} from 'src/store/common'
import {
    mapMutations,
    mapState,
    mapGetters,
    mapActions
} from 'vuex'
import CscPageStickyTabs from 'components/CscPageStickyTabs'
import CscInputButtonSave from 'components/form/CscInputButtonSave'
import CscInputButtonReset from 'components/form/CscInputButtonReset'
import CscChangePasswordDialog from 'src/components/CscChangePasswordDialog'
import CscCallForwardDetails from 'components/pages/CallForward/CscCallForwardDetails.vue'
import { inRange } from 'src/helpers/validation'
import numberFilter from '../filters/number'
import {
    required,
    maxLength,
    between
} from 'vuelidate/lib/validators'
export default {
    name: 'CscPagePbxSeatDetails',
    components: {
        CscPageStickyTabs,
        CscInputButtonSave,
        CscInputButtonReset,
        CscChangePasswordDialog,
        CscCallForwardDetails
    },
    props: {
        initialTab: {
            type: String,
            default: 'preferences'
        }
    },
    data () {
        return {
            changes: null,
            id: this.$route.params.id,
            soundSet: null,
            currentCli: "",
            selectedTab: this.initialTab
        }
    },
    validations: {
        changes: {
            extension: {
                isInRange: function (value) {
                    return inRange(value, this.getMinAllowedExtension, this.getMaxAllowedExtension, between)
                }
            },
            displayName: {
                required,
                maxLength: maxLength(64)
            },
            webUsername: {
                required,
                maxLength: maxLength(64)
            }
        }
    },
    computed: {
        tabs () {
            return [
                {
                    label: this.$t('Preferences'),
                    value: 'preferences',
                    icon: 'perm_phone_msg'
                },
                {
                    label: this.$t('Call Forwards'),
                    value: 'callForwards',
                    icon: 'forward_to_inbox'
                }
            ]
        },
        ...mapState('pbxSeats', [
            'seatSelected',
            'seatUpdateState',
            'seatUpdateError'
        ]),
        ...mapGetters('callForwarding', [
            'groups'
        ]),
        ...mapGetters('user', [
            'hasSubscriberProfileAttribute',
            'hasSubscriberProfileAttributes'
        ]),
        ...mapGetters('pbxSeats', [
            'getSoundSetBySeatId',
            'hasCallQueue',
            'getMusicOnHold',
            'getCurrentCli',
            'getIntraPbx',
            'getSeatUpdateToastMessage',
            'isSeatLoading'
        ]),
        ...mapGetters('pbx', [
            'getExtensionHint',
            'getMinAllowedExtension',
            'getMaxAllowedExtension',
            'getSoundSetOptions',
            'getGroupOptions',
            'getNumberOptions'
        ]),
        getPrimaryNumber () {
            return numberFilter(this.seatSelected.primary_number)
        },
        hasDisplayNameChanged () {
            return this.changes.displayName !== this.seatSelected.display_name
        },
        hasWebUsernameChanged () {
            return this.changes.webUsername !== this.seatSelected.webusername
        },
        hasExtensionChanged () {
            return this.changes.extension !== this.seatSelected.pbx_extension
        },
        hasAliasNumbersChanged () {
            return !_.isEqual(_.cloneDeep(this.changes.aliasNumbers).sort(), this.getAliasNumberIds().sort())
        },
        hasCliNumberChanged () {
            return !_.isEqual(this.changes.cliNumber, this.getCliNumberId())
        },
        hasGroupsChanged () {
            return !_.isEqual(_.cloneDeep(this.changes.groups).sort(), _.cloneDeep(this.seatSelected.pbx_group_ids).sort())
        },
        hasSoundSetChanged () {
            return this.changes.soundSet !== this.getSoundSetId()
        },
        extensionErrorMessage () {
            if (!this.$v.changes.extension.isInRange) {
                return this.getExtensionHint
            } else {
                return ''
            }
        },
        seatDisplayNameErrorMessage () {
            if (!this.$v.changes.displayName.required) {
                return this.$t('{field} is required', {
                    field: this.$t('Seat Display Name')
                })
            } else if (!this.$v.changes.displayName.maxLength) {
                return this.$t('{field} must have at most {maxLength} letters', {
                    field: this.$t('Seat Display Name'),
                    maxLength: this.$v.changes.displayName.$params.maxLength.max
                })
            } else {
                return ''
            }
        },
        seatWebUsernameErrorMessage () {
            if (!this.$v.changes.webUsername.required) {
                return this.$t('{field} is required', {
                    field: this.$t('Seat Web Username')
                })
            } else if (!this.$v.changes.webUsername.maxLength) {
                return this.$t('{field} must have at most {maxLength} letters', {
                    field: this.$t('Seat Web Username'),
                    maxLength: this.$v.changes.webUsername.$params.maxLength.max
                })
            } else {
                return ''
            }
        },
        internalSoundSetOptions () {
            const items = []
            if (this.soundSet) {
                items.push({
                    label: this.soundSet.name,
                    value: this.soundSet.id
                })
            }
            if (_.isArray(this.getSoundSetOptions)) {
                this.getSoundSetOptions.forEach((soundSet) => {
                    if (this.soundSet && this.soundSet.id !== soundSet.value) {
                        items.push(soundSet)
                    } else if (!this.soundSet) {
                        items.push(soundSet)
                    }
                })
            }
            return items
        },
        getCliNumbersOptions () {
            let cliOptions = []
            const clis = [...this.seatSelected.alias_numbers]
            clis.forEach((cli) => {
                cliOptions.push({
                    label: cli.cc + cli.ac + cli.sn,
                    value: cli.cc + cli.ac + cli.sn
                })
            })
            cliOptions = cliOptions.concat(this.getPrimaryNumberOptions())
            return cliOptions
        },
        isLoading () {
            return this.isSeatLoading(this.seatSelected.id)
        }
    },
    watch: {
        seatSelected () {
            this.soundSet = this.getSoundSetBySeatId(this.seatSelected.id)
            this.loadPreferences(this.seatSelected.id).then ( (preferences) => {
                const clis = [...this.seatSelected.alias_numbers]
                this.numbers().forEach((cli) => {
                    clis.push({ac: cli.ac, cc: cli.cc, sn: cli.sn, number_id: cli.id})
                })
                const cliFound = clis.find(cli => cli.cc + cli.ac + cli.sn === preferences.cli)
                if (cliFound) this.currentCli = {
                        label: cliFound.cc + cliFound.ac + cliFound.sn,
                        value: cliFound.cc + cliFound.ac + cliFound.sn
                    }
                this.changes = this.getSeatData()
            })
        },
        seatUpdateState (state) {
            if (state === RequestState.succeeded) {
                showToast(this.getSeatUpdateToastMessage)
            } else if (state === RequestState.failed) {
                showGlobalError(this.seatUpdateError, 5000)
            }
        }
    },
    async mounted () {
        this.selectSeat(this.id)
        await this.loadAnnouncements()
    },
    beforeDestroy () {
        this.resetSelectedSeat()
    },
    methods: {
        ...mapActions('pbxSeats', [
            'setSeatDisplayName',
            'setSeatWebUsername',
            'setSeatExtension',
            'setSeatNumbers',
            'setSeatGroups',
            'setIntraPbx',
            'setMusicOnHold',
            'setSeatSoundSet',
            'loadPreferences',
            'setCli'
        ]),
        ...mapActions('callForwarding', [
            'loadAnnouncements'
        ]),
        ...mapActions('pbxCallQueues', [
            'jumpToCallQueue'
        ]),
        ...mapMutations('pbxSeats', [
            'selectSeat',
            'resetSelectedSeat'
        ]),
        ...mapGetters('pbx', [
            'getPrimaryNumberOptions',
            'numbers'
        ]),
        selectTab (tabName) {
            if (this.selectedTab !== tabName) {
                this.forceTabReload(tabName)
            }
        },
        forceTabReload (tabName) {
            this.selectedTab = tabName
        },
        getAliasNumberIds () {
            const numberIds = []
            this.seatSelected.alias_numbers.forEach((number) => {
                numberIds.push(number.number_id)
            })
            return numberIds
        },
        getGroupIds () {
            return _.clone(this.seatSelected.pbx_group_ids)
        },
        getCliNumberId () {
            return this.currentCli
        },
        getSoundSetId () {
            const soundSet = this.getSoundSetBySeatId(this.seatSelected.id)
            if (soundSet) {
                return soundSet.id
            }
            return null
        },
        getSeatData () {
            return (this.seatSelected) ? {
                displayName: this.seatSelected.display_name,
                sipUsername: this.seatSelected.username,
                webUsername: this.seatSelected.webusername,
                extension: this.seatSelected.pbx_extension,
                aliasNumbers: this.getAliasNumberIds(),
                webPassword: this.seatSelected.webpassword,
                clirIntrapbx: this.getIntraPbx(this.seatSelected.id),
                musicOnHold: this.getMusicOnHold(this.seatSelected.id),
                groups: this.getGroupIds(),
                soundSet: this.getSoundSetId(),
                cliNumber: this.getCliNumberId()
            } : null
        },
        resetDisplayName () {
            this.changes.displayName = this.seatSelected.display_name
        },
        resetWebUsername () {
            this.changes.webUsername = this.seatSelected.webusername
        },
        resetExtension () {
            this.changes.extension = this.seatSelected.pbx_extension
        },
        resetAliasNumbers () {
            this.changes.aliasNumbers = this.getAliasNumberIds()
        },
        resetCliNumber () {
            this.changes.cliNumber = this.getCliNumberId()
        },
        resetGroups () {
            this.changes.groups = this.getGroupIds()
        },
        resetSoundSet () {
            this.changes.soundSet = this.getSoundSetId()
        },
        save () {
            if (this.hasDisplayNameChanged) {
                this.setSeatDisplayName({
                    seatId: this.seatSelected.id,
                    displayName: this.changes.displayName
                })
            }
            if (this.hasWebUsernameChanged) {
                this.setSeatWebUsername({
                    seatId: this.seatSelected.id,
                    webUsername: this.changes.webUsername
                })
            }
            if (this.hasExtensionChanged) {
                this.setSeatExtension({
                    seatId: this.seatSelected.id,
                    seatExtension: this.changes.extension
                })
            }
            if (this.hasAliasNumbersChanged) {
                this.setSeatNumbers({
                    seatId: this.seatSelected.id,
                    assignedNumbers: _.difference(this.changes.aliasNumbers, this.getAliasNumberIds()),
                    unassignedNumbers: _.difference(this.getAliasNumberIds(), this.changes.aliasNumbers)
                })
            }
            if (this.hasCliNumberChanged) {
                this.setCli({
                    seatId: this.seatSelected.id,
                    cli: this.changes.cliNumber
                })
            }
            if (this.hasGroupsChanged) {
                this.setSeatGroups({
                    seatId: this.seatSelected.id,
                    groupIds: this.changes.groups
                })
            }
            if (this.hasSoundSetChanged) {
                this.setSeatSoundSet({
                    seatId: this.seatSelected.id,
                    soundSetId: this.changes.soundSet
                })
            }
        },
        changeIntraPbx () {
            this.setIntraPbx( {
                seatId: this.seatSelected.id,
                intraPbx: this.changes.clirIntrapbx
            })
        },
        async changeMusicOnHold () {
            try {
                this.setMusicOnHold({
                    seatId: this.seatSelected.id,
                    musicOnHold: this.changes.musicOnHold
                })
            } catch (err) {
                showGlobalError(err?.message || this.$t('Unknown error'))
                this.changes.musicOnHold = !this.changes.musicOnHold
            }
        },
        goToCallQueue () {
            this.jumpToCallQueue(this.seatSelected)
        },
    }
}
</script>
