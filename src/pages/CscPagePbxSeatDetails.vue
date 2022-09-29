<template>
    <csc-page-sticky
        id="csc-page-pbx-seats-details"
        class="row q-pa-lg"
    >

        <template
            v-slot:header-align-left
        >
            <q-breadcrumbs
                v-if="seatSelected"
                    class="text-weight-light q-mr-md"
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
                        :label="seatSelected.display_name"
                    />
                </q-breadcrumbs>
        </template>
        <q-item
            class="col col-xs-12 col-md-6"
        >

            <q-list
                v-if="changes"
                class="col"
                side
                top
                no-wrap
            >
                <csc-change-password-dialog
                    ref="changePasswordDialog"
                    @change-password="changeWebPassword({ password: $event.password })"
                />
                <q-input
                    v-model="changes.name"
                    :label="$t('Name')"
                    :disable="isLoading"
                    @keyup.enter="save"
                >
                    <template
                        v-slot:append
                    >
                        <csc-input-button-save
                            v-if="hasNameChanged"
                            @click.stop="save"
                        />
                        <csc-input-button-reset
                            v-if="hasNameChanged"
                            @click.stop="resetName"
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
                        v-slot:append
                    >
                        <csc-input-button-save
                            v-if="hasExtensionChanged"
                            @click.stop="save"
                        />
                        <csc-input-button-reset
                            v-if="hasExtensionChanged"
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

    </csc-page-sticky>
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
import CscInputButtonSave from 'components/form/CscInputButtonSave'
import CscInputButtonReset from 'components/form/CscInputButtonReset'
import CscChangePasswordDialog from 'src/components/CscChangePasswordDialog'
import CscPageSticky from 'src/components/CscPageSticky'
import { between } from 'vuelidate/lib/validators'
import { inRange } from 'src/helpers/validation'
import numberFilter from '../filters/number'
export default {
    name: 'CscPagePbxSeatDetails',
    components: {
        CscInputButtonReset,
        CscInputButtonSave,
        CscChangePasswordDialog,
        CscPageSticky
    },
    props: {
    },
    data () {
        return {
            changes: null,
            id: this.$route.params.id,
            soundSet: null
        }
    },
    validations: {
        changes: {
            extension: {
                isInRange: function (value) {
                    return inRange(value, this.getMinAllowedExtension, this.getMaxAllowedExtension, between)
                }
            }
        }
    },
    computed: {
        ...mapState('pbxSeats', [
            'seatSelected',
            'seatUpdateState',
            'seatUpdateError'
        ]),
        ...mapGetters('pbxSeats', [
            'getSoundSetBySeatId',
            'hasCallQueue',
            'getMusicOnHold',
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
        hasNameChanged () {
            return this.changes.name !== this.seatSelected.display_name
        },
        hasExtensionChanged () {
            return this.changes.extension !== this.seatSelected.pbx_extension
        },
        hasAliasNumbersChanged () {
            return !_.isEqual(_.cloneDeep(this.changes.aliasNumbers).sort(), this.getAliasNumberIds().sort())
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
        isLoading () {
            return this.isSeatLoading(this.seatSelected.id)
        }
    },
    watch: {
        seatSelected () {
            this.changes = this.getSeatData()
            this.soundSet = this.getSoundSetBySeatId(this.seatSelected.id)
        },
        seatUpdateState (state) {
            if (state === RequestState.succeeded) {
                showToast(this.getSeatUpdateToastMessage)
            } else if (state === RequestState.failed) {
                showGlobalError(this.seatUpdateError, 5000)
            }
        }
    },
    mounted () {
        this.selectSeat(this.id)
    },
    beforeDestroy () {
        this.resetSelectedSeat()
    },
    methods: {
        ...mapActions('pbxSeats', [
            'setSeatName',
            'setSeatExtension',
            'setSeatNumbers',
            'setSeatGroups',
            'setIntraPbx',
            'setMusicOnHold',
            'setSeatSoundSet'
        ]),
        ...mapActions('pbxCallQueues', [
            'jumpToCallQueue'
        ]),
        ...mapMutations('pbxSeats', [
            'selectSeat',
            'resetSelectedSeat'
        ]),
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
        getSoundSetId () {
            const soundSet = this.getSoundSetBySeatId(this.seatSelected.id)
            if (soundSet) {
                return soundSet.id
            }
            return null
        },
        getSeatData () {
            return (this.seatSelected) ? {
                name: this.seatSelected.display_name,
                extension: this.seatSelected.pbx_extension,
                aliasNumbers: this.getAliasNumberIds(),
                webPassword: this.seatSelected.webpassword,
                clirIntrapbx: this.getIntraPbx(this.seatSelected.id),
                musicOnHold: this.getMusicOnHold(this.seatSelected.id),
                groups: this.getGroupIds(),
                soundSet: this.getSoundSetId()
            } : null
        },
        resetName () {
            this.changes.name = this.seatSelected.display_name
        },
        resetExtension () {
            this.changes.extension = this.seatSelected.pbx_extension
        },
        resetAliasNumbers () {
            this.changes.aliasNumbers = this.getAliasNumberIds()
        },
        resetGroups () {
            this.changes.groups = this.getGroupIds()
        },
        resetSoundSet () {
            this.changes.soundSet = this.getSoundSetId()
        },
        save () {
            if (this.hasNameChanged) {
                this.setSeatName({
                    seatId: this.seatSelected.id,
                    seatName: this.changes.name
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
