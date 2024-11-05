<template>
    <csc-page-sticky-tabs
        id="csc-page-pbx-groups-details"
        ref="pageSticky"
        :value="selectedTab"
    >
        <template
            #tabs
        >
            <q-breadcrumbs
                class="q-item absolute absolute-left text-weight-light"
                active-color="primary"
                separator-color="primary"
            >
                <q-breadcrumbs-el
                    key="groups"
                    class="cursor-pointer"
                    to="/user/pbx-configuration/groups"
                    :label="$t('Groups')"
                    icon="group"
                />
                <q-breadcrumbs-el
                    v-if="groupSelected"
                    key="group"
                    :label="groupSelected.display_name"
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
                <q-input
                    v-model="changes.name"
                    :label="$t('Name')"
                    :disable="isLoading"
                    @keyup.enter="save"
                >
                    <template
                        v-if="hasNameChanged"
                        #append
                    >
                        <csc-input-button-save
                            @click.stop="save"
                        />
                        <csc-input-button-reset
                            @click.stop="resetName"
                        />
                    </template>
                </q-input>
                <q-input
                    readonly
                    disable
                    :model-value="changes.sipUsername"
                    :label="$t('SIP Username')"
                />
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
                    :model-value="getPrimaryNumber"
                    :label="$t('Primary Number')"
                />
                <q-select
                    v-model="changes.huntPolicy"
                    emit-value
                    map-options
                    radio
                    :label="$t('Hunt Policy')"
                    :disable="isLoading"
                    :options="getHuntPolicyOptions"
                >
                    <template
                        v-if="hasHuntPolicyChanged"
                        #append
                    >
                        <csc-input-button-save
                            @click.stop="save"
                        />
                        <csc-input-button-reset
                            @click.stop="resetHuntPolicy"
                        />
                    </template>
                </q-select>
                <q-input
                    v-model="changes.huntTimeout"
                    :label="$t('Hunt Timeout')"
                    :disable="isLoading"
                    @keyup.enter="save"
                >
                    <template
                        v-if="hasHuntTimeoutChanged"
                        #append
                    >
                        <csc-input-button-save
                            @click.stop="save"
                        />
                        <csc-input-button-reset
                            @click.stop="resetHuntTimeout"
                        />
                    </template>
                </q-input>
                <q-select
                    v-model="changes.huntCancelMode"
                    emit-value
                    map-options
                    radio
                    :label="$t('Cancel Mode')"
                    :disable="isLoading"
                    :options="getHuntCancelModeOptions"
                >
                    <template
                        v-if="hasHuntCancelModeChanged"
                        #append
                    >
                        <csc-input-button-save
                            @click.stop="save"
                        />
                        <csc-input-button-reset
                            @click.stop="resetHuntCancelMode"
                        />
                    </template>
                </q-select>
                <q-select
                    v-model="changes.aliasNumbers"
                    emit-value
                    map-options
                    use-chips
                    multiple
                    :disable="isLoading"
                    :label="$t('Alias Numbers')"
                    :options="getNumberOptions"
                >
                    <template
                        v-if="hasAliasNumbersChanged"
                        #append
                    >
                        <csc-input-button-save
                            @click.stop="save"
                        />
                        <csc-input-button-reset
                            @click.stop="resetAliasNumbers"
                        />
                    </template>
                </q-select>
                <q-select
                    v-model="changes.seats"
                    emit-value
                    map-options
                    use-chips
                    multiple
                    :disable="isLoading"
                    :label="$t('Seats')"
                    :options="getSeatOptions"
                >
                    <template
                        v-if="hasSeatsChanged"
                        #append
                    >
                        <csc-input-button-save
                            @click.stop="save"
                        />
                        <csc-input-button-reset
                            @click.stop="resetSeats"
                        />
                    </template>
                </q-select>
                <q-select
                    v-model="changes.soundSet"
                    emit-value
                    map-options
                    radio
                    :disable="isLoading"
                    :label="$t('Sound Set')"
                    :options="getSoundSetOptions"
                >
                    <template
                        v-if="hasSoundSetChanged"
                        #append
                    >
                        <csc-input-button-save
                            @click.stop="save"
                        />
                        <csc-input-button-reset
                            @click.stop="resetSoundSet"
                        />
                    </template>
                </q-select>
                <q-btn
                    v-if="hasCallQueue(id)"
                    icon="filter_none"
                    flat
                    color="primary"
                    :label="$t('Call Queue')"
                    :disable="isLoading"
                    @click="jumpToCallQueueInternal"
                />
            </q-list>
        </q-item>

        <csc-call-forward-details
            v-if="selectedTab === 'callForwards'"
            :id="id"
        />
        <csc-page-voicebox
            v-if="selectedTab === 'voicebox'"
            :id="id"
        />
        <csc-fax-to-mail-settings
            v-if="selectedTab === 'fax2mail'"
            :id="id"
        />
        <csc-mail-to-fax-settings
            v-if="selectedTab === 'mail2fax'"
            :id="id"
        />
    </csc-page-sticky-tabs>
</template>

<script>
import useValidate from '@vuelidate/core'
import CscPageStickyTabs from 'components/CscPageStickyTabs'
import CscInputButtonReset from 'components/form/CscInputButtonReset'
import CscInputButtonSave from 'components/form/CscInputButtonSave'
import CscCallForwardDetails from 'components/pages/CallForward/CscCallForwardDetails'
import CscFaxToMailSettings from 'components/pages/FaxSettings/CscFaxToMailSettings'
import CscMailToFaxSettings from 'components/pages/FaxSettings/CscMailToFaxSettings'
import _ from 'lodash'
import CscPageVoicebox from 'pages/CscPageVoicebox'
import numberFilter from 'src/filters/number'
import { showGlobalError, showToast } from 'src/helpers/ui'
import { inRange } from 'src/helpers/validation'
import { RequestState } from 'src/store/common'
import {
    mapActions,
    mapGetters,
    mapMutations,
    mapState
} from 'vuex'
export default {
    name: 'CscPagePbxGroupDetails',
    components: {
        CscInputButtonReset,
        CscInputButtonSave,
        CscPageStickyTabs,
        CscCallForwardDetails,
        CscPageVoicebox,
        CscFaxToMailSettings,
        CscMailToFaxSettings
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
            selectedTab: this.initialTab,
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
                },
                {
                    label: this.$t('Voicebox'),
                    value: 'voicebox',
                    icon: 'voicemail'
                },
                {
                    label: this.$t('Fax to mail and sendfax'),
                    value: 'fax2mail',
                    icon: 'perm_phone_msg'
                },
                {
                    label: this.$t('Mail to Fax'),
                    value: 'mail2fax',
                    icon: 'forward_to_inbox'
                }
            ]
        },
        ...mapState('pbxGroups', [
            'groupSelected',
            'groupUpdateState',
            'groupUpdateError'
        ]),
        ...mapGetters('pbx', [
            'getSeatOptions',
            'getExtensionHint',
            'getMinAllowedExtension',
            'getMaxAllowedExtension',
            'getNumberOptions',
            'getSoundSetOptions'
        ]),
        ...mapGetters('pbxGroups', [
            'getHuntPolicyOptions',
            'hasCallQueue',
            'getGroupUpdateToastMessage',
            'getSoundSetByGroupId',
            'isGroupLoading',
            'getHuntCancelModeOptions'
        ]),
        ...mapGetters('callForwarding', [
            'groups'
        ]),
        hasNameChanged () {
            return this.changes.name !== this.groupSelected.display_name
        },
        hasExtensionChanged () {
            return this.changes.extension !== this.groupSelected.pbx_extension
        },
        hasHuntPolicyChanged () {
            return this.changes.huntPolicy !== this.groupSelected.pbx_hunt_policy
        },
        hasHuntTimeoutChanged () {
            return this.changes.huntTimeout !== this.groupSelected.pbx_hunt_timeout
        },
        hasHuntCancelModeChanged () {
            return this.changes.huntCancelMode !== this.groupSelected.pbx_hunt_cancel_mode
        },
        hasAliasNumbersChanged () {
            const aliasNumbers = _.clone(this.changes.aliasNumbers)
            return !_.isEqual(aliasNumbers.sort(), this.getAliasNumberIds().sort())
        },
        hasSeatsChanged () {
            const seatIds1 = _.clone(this.changes.seats)
            const seatIds2 = _.clone(this.groupSelected.pbx_groupmember_ids)
            return !_.isEqual(seatIds1.sort(), seatIds2.sort())
        },
        hasSoundSetChanged () {
            return this.changes.soundSet !== this.getSoundSetId()
        },
        getPrimaryNumber () {
            return numberFilter(this.groupSelected.primary_number)
        },
        extensionErrorMessage () {
            const errorsTab = this.v$.changes.extension.$errors
            if (errorsTab && errorsTab.length > 0 && errorsTab[0].$validator === 'isInRange') {
                return this.getExtensionHint
            }
            return ''
        },
        isLoading () {
            return this.isGroupLoading(this.groupSelected.id)
        }
    },
    watch: {
        groupSelected () {
            this.changes = this.getGroupData()
            this.soundSet = this.getSoundSetByGroupId(this.groupSelected.id)
        },
        groupUpdateState (state) {
            if (state === RequestState.succeeded) {
                showToast(this.getGroupUpdateToastMessage)
            } else if (state === RequestState.failed) {
                showGlobalError(this.groupUpdateError)
            }
        }
    },
    mounted () {
        this.selectGroup(this.id)
        this.loadMappingsFull(this.id)
    },
    beforeUnmount () {
        this.resetSelectedGroup()
    },
    validations: {
        changes: {
            extension: {
                isInRange: function (value) {
                    return inRange(value, this.getMinAllowedExtension, this.getMaxAllowedExtension)
                }
            }
        }
    },
    methods: {
        ...mapActions('pbxGroups', [
            'setGroupName',
            'setGroupExtension',
            'setGroupHuntPolicy',
            'setGroupHuntTimeout',
            'setGroupHuntCancelMode',
            'setGroupSeats',
            'setGroupNumbers',
            'setGroupSoundSet'
        ]),
        ...mapActions('pbxCallQueues', [
            'jumpToCallQueue'
        ]),
        ...mapActions('callForwarding', [
            'loadMappingsFull',
            'createMapping'
        ]),
        ...mapMutations('pbxGroups', [
            'selectGroup',
            'resetSelectedGroup'
        ]),
        getGroupData () {
            return (this.groupSelected)
                ? {
                    name: this.groupSelected.display_name,
                    sipUsername: this.groupSelected.username,
                    extension: this.groupSelected.pbx_extension,
                    huntPolicy: this.groupSelected.pbx_hunt_policy,
                    huntTimeout: this.groupSelected.pbx_hunt_timeout,
                    huntCancelMode: this.groupSelected.pbx_hunt_cancel_mode,
                    aliasNumbers: this.getAliasNumberIds(),
                    seats: this.getSeatIds(),
                    soundSet: this.getSoundSetId()
                }
                : null
        },
        getAliasNumberIds () {
            const numberIds = []
            this.groupSelected.alias_numbers.forEach((number) => {
                numberIds.push(number.number_id)
            })
            return numberIds
        },
        getSeatIds () {
            return _.clone(this.groupSelected.pbx_groupmember_ids)
        },
        getSoundSetId () {
            const soundSet = this.getSoundSetByGroupId(this.groupSelected.id)
            if (soundSet !== null) {
                return soundSet.id
            }
            return null
        },
        resetName () {
            this.changes.name = this.groupSelected.display_name
        },
        resetExtension () {
            this.changes.extension = this.groupSelected.pbx_extension
        },
        resetHuntPolicy () {
            this.changes.huntPolicy = this.groupSelected.pbx_hunt_policy
        },
        resetHuntTimeout () {
            this.changes.huntTimeout = this.groupSelected.pbx_hunt_timeout
        },
        resetHuntCancelMode () {
            this.changes.huntCancelMode = this.groupSelected.pbx_hunt_cancel_mode
        },
        resetAliasNumbers () {
            this.changes.aliasNumbers = this.getAliasNumberIds()
        },
        resetSeats () {
            this.changes.seats = this.getSeatIds()
        },
        resetSoundSet () {
            this.changes.soundSet = this.getSoundSetId()
        },
        jumpToCallQueueInternal () {
            this.jumpToCallQueue(this.groupSelected)
        },
        save () {
            if (this.hasNameChanged) {
                this.setGroupName({
                    groupId: this.groupSelected.id,
                    groupName: this.changes.name
                })
            }
            if (this.hasExtensionChanged) {
                this.setGroupExtension({
                    groupId: this.groupSelected.id,
                    groupExtension: this.changes.extension
                })
            }
            if (this.hasHuntPolicyChanged) {
                this.setGroupHuntPolicy({
                    groupId: this.groupSelected.id,
                    groupHuntPolicy: this.changes.huntPolicy
                })
            }
            if (this.hasHuntTimeoutChanged) {
                this.setGroupHuntTimeout({
                    groupId: this.groupSelected.id,
                    groupHuntTimeout: this.changes.huntTimeout
                })
            }
            if (this.hasHuntCancelModeChanged) {
                this.setGroupHuntCancelMode({
                    groupId: this.groupSelected.id,
                    groupHuntCancelMode: this.changes.huntCancelMode
                })
            }
            if (this.hasAliasNumbersChanged) {
                this.setGroupNumbers({
                    groupId: this.groupSelected.id,
                    assignedNumbers: _.difference(this.changes.aliasNumbers, this.getAliasNumberIds()),
                    unassignedNumbers: _.difference(this.getAliasNumberIds(), this.changes.aliasNumbers)
                })
            }
            if (this.hasSeatsChanged) {
                this.setGroupSeats({
                    groupId: this.groupSelected.id,
                    seatIds: this.changes.seats
                })
            }
            if (this.hasSoundSetChanged) {
                this.setGroupSoundSet({
                    groupId: this.groupSelected.id,
                    soundSetId: this.changes.soundSet
                })
            }
        },
        selectTab (tabName) {
            if (this.selectedTab !== tabName) {
                this.forceTabReload(tabName)
            }
        },
        forceTabReload (tabName) {
            this.selectedTab = tabName
        }
    }
}
</script>
