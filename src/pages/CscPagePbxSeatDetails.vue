<template>
    <csc-page-sticky-tabs
        id="csc-page-pbx-seats-details"
        ref="pageSticky"
        :value="selectedTab"
    >
        <template
            #tabs
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
                :key="tab.value"
                class="d-flex justify-content-center"
                :name="tab.value"
                :icon="tab.icon"
                :label="tab.label"
                :default="tab.value === selectedTab"
                @click="selectTab(tab.value)"
            />
        </template>

        <q-item
            v-if="selectedTab === 'preferences'"
            class="col col-xs-12 col-md-6"
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
                    :error="v$.changes.displayName.$errors.length > 0"
                    :error-message="seatDisplayNameErrorMessage"
                    @update:model-value="v$.changes.displayName.$touch()"
                    @keyup.enter="save"
                >
                    <template
                        v-if="hasDisplayNameChanged"
                        #append
                    >
                        <csc-input-button-save
                            v-if="v$.changes.displayName.$errors.length <= 0"
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
                    :model-value="changes.sipUsername"
                />
                <q-input
                    v-model="changes.webUsername"
                    :label="$t('Web Username')"
                    :disable="isLoading"
                    :error="v$.changes.webUsername.$errors.length > 0"
                    :error-message="seatWebUsernameErrorMessage"
                    @update:model-value="v$.changes.webUsername.$touch()"
                    @keyup.enter="save"
                >
                    <template
                        v-if="hasWebUsernameChanged"
                        #append
                    >
                        <csc-input-button-save
                            v-if="v$.changes.webUsername.$errors.length <= 0"
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
                    :error="v$.changes.extension.$errors.length > 0"
                    :error-message="extensionErrorMessage"
                    :label="$t('Extension')"
                    :hint="getExtensionHint"
                    :disable="isLoading"
                    @keyup.enter="save"
                    @update:model-value="v$.changes.extension.$touch()"
                >
                    <template
                        v-if="hasExtensionChanged"
                        #append
                    >
                        <csc-input-button-save
                            v-if="v$.changes.webUsername.$errors.length <= 0"
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
                    :model-value="getPrimaryNumber"
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
                        #append
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
                        #append
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
                        #append
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
                        #append
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
                <q-select
                    v-model="changes.ncos"
                    use-chips
                    radio
                    emit-value
                    map-options
                    :disable="isLoading"
                    :options="ncosOptions"
                    :label="$t('Ncos')"
                >
                    <template
                        #append
                    >
                        <csc-input-button-save
                            v-if="hasNcosChanged"
                            @click.stop="save"
                        />
                        <csc-input-button-reset
                            v-if="hasNcosChanged"
                            @click.stop="resetNcos"
                        />
                    </template>
                </q-select>
                <q-select
                    v-model="changes.ncosSet"
                    use-chips
                    radio
                    emit-value
                    map-options
                    :disable="isLoading"
                    :options="ncosSetOptions"
                    :label="$t('Ncos Set')"
                >
                    <template
                        #append
                    >
                        <csc-input-button-save
                            v-if="hasNcosSetChanged"
                            @click.stop="save"
                        />
                        <csc-input-button-reset
                            v-if="hasNcosSetChanged"
                            @click.stop="resetNcosSet"
                        />
                    </template>
                </q-select>
                <q-toggle
                    v-model="changes.clirIntrapbx"
                    class="q-pa-sm"
                    :label="$t('Hide number within own PBX')"
                    :disable="isLoading"
                    @update:model-value="changeIntraPbx"
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
                    @update:model-value="changeMusicOnHold"
                />
            </q-list>
        </q-item>

        <csc-call-forward-details
            v-else
            :id="id"
            :key="id"
        />
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
import useValidate from '@vuelidate/core'
import {
    required,
    maxLength
} from '@vuelidate/validators'
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
            currentCli: '',
            selectedTab: this.initialTab,
            ncosOptions: [],
            ncosSetOptions: [],
            v$: useValidate()
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
            'getNcosBySeatId',
            'hasCallQueue',
            'getMusicOnHold',
            'getDefaultNcos',
            'getDefaultNcosSet',
            'getCurrentCli',
            'getIntraPbx',
            'getSeatUpdateToastMessage',
            'isSeatLoading',
            'isSeatMapByIdEmpty',
            'getAnnouncementCfu',
            'getAnnouncementCallSetup',
            'getAnnouncementToCallee',
            'getIgnoreCfWhenHunting',
            'getCstaClient',
            'getCstaController'
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
        hasNcosChanged () {
            return this.changes.ncos !== this.getDefaultNcos(this.seatSelected.id)
        },
        hasNcosSetChanged () {
            return this.changes.ncosSet !== this.getDefaultNcosSet(this.seatSelected.id)
        },
        extensionErrorMessage () {
            const errorsTab = this.v$.changes.extension.$errors
            if (errorsTab && errorsTab.length > 0 && errorsTab[0].$validator === 'isInRange') {
                return this.getExtensionHint
            } else {
                return ''
            }
        },
        seatDisplayNameErrorMessage () {
            const errorsTab = this.v$.changes.displayName.$errors
            if (errorsTab && errorsTab.length > 0 && errorsTab[0].$validator === 'required') {
                return this.$t('{field} is required', {
                    field: this.$t('Seat Display Name')
                })
            } else if (errorsTab && errorsTab.length > 0 && errorsTab[0].$validator === 'maxLength') {
                return this.$t('{field} must have at most {maxLength} letters', {
                    field: this.$t('Seat Display Name'),
                    maxLength: this.v$.changes.displayName.maxLength.$params.max
                })
            } else {
                return ''
            }
        },
        seatWebUsernameErrorMessage () {
            const errorsTab = this.v$.changes.webUsername.$errors
            if (errorsTab && errorsTab.length > 0 && errorsTab[0].$validator === 'required') {
                return this.$t('{field} is required', {
                    field: this.$t('Seat Web Username')
                })
            } else if (errorsTab && errorsTab.length > 0 && errorsTab[0].$validator === 'maxLength') {
                return this.$t('{field} must have at most {maxLength} letters', {
                    field: this.$t('Seat Web Username'),
                    maxLength: this.v$.changes.webUsername.maxLength.$params.max
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
            cliOptions = cliOptions.concat(this.getFullNumberOptions())
            return cliOptions
        },
        isLoading () {
            return this.isSeatLoading(this.seatSelected.id)
        }
    },
    watch: {
        async $route (to) {
            if (this.id !== to.params.id) {
                this.id = to.params.id
                this.selectSeat(this.id)
            }
        },
        seatSelected () {
            this.soundSet = this.getSoundSetBySeatId(this.seatSelected.id)
            this.loadPreferences(this.seatSelected.id).then((preferences) => {
                const clis = [...this.seatSelected.alias_numbers]
                this.numbers().forEach((cli) => {
                    clis.push({ ac: cli.ac, cc: cli.cc, sn: cli.sn, number_id: cli.id })
                })
                const cliFound = clis.find(cli => cli.cc + cli.ac + cli.sn === preferences.cli)
                if (cliFound) {
                    this.currentCli = {
                        label: cliFound.cc + cliFound.ac + cliFound.sn,
                        value: cliFound.cc + cliFound.ac + cliFound.sn
                    }
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
    async created () {
        await this.getNcosSubscriber()
        await this.getNcosSetsSubscriber()
    },
    validations: {
        changes: {
            extension: {
                isInRange: function (value) {
                    return inRange(value, this.getMinAllowedExtension, this.getMaxAllowedExtension)
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
    async mounted () {
        if (this.isSeatMapByIdEmpty) {
            await this.loadSeatListItems()
        }

        this.selectSeat(this.$route.params.id)
        await this.loadAnnouncements()
        // await this.getNcosLevelsSubscriber()
        await this.getNcosSetSubscriber()
    },
    beforeUnmount () {
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
            'loadSeatListItems',
            'loadPreferences',
            'setCli',
            'setNcosSet',
            'NcosSet'
        ]),
        ...mapActions('user', [
            'getNcosLevelsSubscriber',
            'getNcosSetSubscriber'
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
            'getFullNumberOptions',
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
        getNcosId () {
            const ncos = this.getNcosBySeatId(this.seatSelected.id)
            if (ncos) {
                return ncos.id
            }
            return null
        },
        getSeatData () {
            return (this.seatSelected)
                ? {
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
                    cliNumber: this.getCliNumberId(),
                    ncos: this.getDefaultNcos(this.seatSelected.id),
                    ncosSet: this.getDefaultNcosSet(this.seatSelected.id)
                }
                : null
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
        resetNcos () {
            this.changes.ncos = this.getDefaultNcos(this.seatSelected.id)
        },
        resetNcosSet () {
            this.changes.ncosSet = this.getDefaultNcosSet(this.seatSelected.id)
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
            if (this.hasNcosChanged) {
                this.setNcosSet({
                    seatId: this.seatSelected.id,
                    ncosId: this.changes.ncos
                })
            }
            if (this.hasNcosSetChanged) {
                this.NcosSet({
                    seatId: this.seatSelected.id,
                    ncosSetId: this.changes.ncosSet
                })
            }
        },
        changeIntraPbx () {
            this.setIntraPbx({
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
        async getNcosSubscriber () {
            const listNcos = await this.getNcosLevelsSubscriber()
            this.ncosOptions = listNcos.map((ncos) => ({
                label: ncos.label,
                value: ncos.value
            }))
        },
        async getNcosSetsSubscriber () {
            const listNcosSet = await this.getNcosSetSubscriber()
            this.ncosSetOptions = listNcosSet.map((ncosSet) => ({
                label: ncosSet.label,
                value: ncosSet.value
            }))
        }
    }
}
</script>
