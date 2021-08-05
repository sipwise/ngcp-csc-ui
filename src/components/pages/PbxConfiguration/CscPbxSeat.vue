<template>
    <q-expansion-item
        group="seats"
        header-class="q-pa-sm"
        active-class="csc-item-odd"
        dense-toggle
    >
        <template
            slot="header"
        >
            <q-item-section
                side
                top
                no-wrap
            >
                <q-icon
                    name="person"
                    color="white"
                />
            </q-item-section>
            <q-item-section>
                <q-item-label
                    class="text-subtitle1"
                >
                    {{ seat | seatName }}
                </q-item-label>
                <q-item-label
                    caption
                >
                    {{ $t('Login') }}: <strong>{{ seat.webusername }}</strong>
                </q-item-label>
                <q-item-label
                    caption
                >
                    {{ $t('Extension') }}: <strong>{{ seat.pbx_extension }}</strong>
                </q-item-label>
                <q-item-label
                    caption
                >
                    <span
                        v-if="seat.pbx_group_ids.length > 0"
                    >
                        {{ $t('Groups') }}:
                        <span
                            v-for="groupId in seat.pbx_group_ids"
                            :key="groupId"
                            class="csc-list-item-title-keyword"
                        >
                            <q-icon
                                name="group"
                                size="16px"
                            />
                            {{ groups[groupId] | groupName }}
                        </span>
                    </span>
                    <span
                        v-else
                    >
                        <q-icon
                            class="self-center"
                            name="group"
                            size="16px"
                        />
                        {{ $t('No groups') }}
                    </span>
                </q-item-label>
            </q-item-section>
            <q-item-section
                side
                top
            >
                <csc-more-menu>
                    <csc-popup-menu-item
                        icon="vpn_key"
                        color="primary"
                        :label="$t('Change Password')"
                        @click="showPasswordDialog"
                    />
                    <csc-popup-menu-item
                        icon="vpn_key"
                        color="primary"
                        :label="$t('Change SIP Password')"
                        @click="showSIPPasswordDialog"
                    />
                    <csc-popup-menu-item-delete
                        @click="deleteSeat"
                    />
                    <q-separator />
                    <q-item
                        class="no-padding"
                    >
                        <q-item-section>
                            <q-toggle
                                v-model="changes.clirIntrapbx"
                                class="q-pa-sm"
                                :label="$t('Hide number within own PBX')"
                                :disable="loading"
                                @input="changeIntraPbx"
                            />
                        </q-item-section>
                    </q-item>
                </csc-more-menu>
            </q-item-section>
        </template>
        <div
            class="q-pa-md"
        >
            <csc-change-password-dialog
                ref="changePasswordDialog"
                :loading="false"
                @change-password="changeWebPassword({ password: $event.password })"
            />
            <q-input
                v-model="changes.name"
                :label="$t('Name')"
                :disable="loading"
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
                :disable="loading"
                :hint="getExtensionHint"
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
                :options="aliasNumberOptions"
                :label="$t('Alias Numbers')"
                :disable="loading"
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
                :options="groupOptions"
                :label="$t('Groups')"
                :disable="loading"
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
                :options="soundSetOptions"
                :label="$t('Sound Set')"
                :disable="loading"
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
                :disable="loading"
                @input="changeIntraPbx"
            />
            <q-btn
                v-if="hasCallQueue"
                icon="filter_none"
                flat
                color="primary"
                :label="$t('Call Queue')"
                :disable="loading"
                @click="jumpToCallQueue"
            />
        </div>
    </q-expansion-item>
</template>

<script>
import _ from 'lodash'
import { mapGetters } from 'vuex'
import { between } from 'vuelidate/lib/validators'
import { inRange } from 'src/helpers/validation'
import CscChangePasswordDialog from '../../CscChangePasswordDialog'
import numberFilter from '../../../filters/number'
import CscInputButtonSave from 'components/form/CscInputButtonSave'
import CscInputButtonReset from 'components/form/CscInputButtonReset'
import CscMoreMenu from 'components/CscMoreMenu'
import CscPopupMenuItemDelete from 'components/CscPopupMenuItemDelete'
import CscPopupMenuItem from 'components/CscPopupMenuItem'
import CscDialogChangePassword from 'components/CscDialogChangePassword'
export default {
    name: 'CscPbxSeat',
    components: {
        CscPopupMenuItem,
        CscPopupMenuItemDelete,
        CscMoreMenu,
        CscInputButtonReset,
        CscInputButtonSave,
        CscChangePasswordDialog
    },
    props: {
        seat: {
            type: Object,
            default: undefined
        },
        intraPbx: {
            type: Boolean,
            default: undefined
        },
        groups: {
            type: Object,
            default: undefined
        },
        soundSet: {
            type: Object,
            default: undefined
        },
        expanded: {
            type: Boolean,
            default: undefined
        },
        loading: {
            type: Boolean,
            default: undefined
        },
        aliasNumberOptions: {
            type: Array,
            default: undefined
        },
        groupOptions: {
            type: Array,
            default: undefined
        },
        soundSetOptions: {
            type: Array,
            default: undefined
        },
        odd: {
            type: Boolean,
            default: undefined
        },
        labelWidth: {
            type: Number,
            default: undefined
        },
        hasCallQueue: {
            type: Boolean,
            default: undefined
        }
    },
    data () {
        return {
            changes: this.getSeatData()
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
        ...mapGetters('pbx', [
            'getExtensionHint',
            'getMinAllowedExtension',
            'getMaxAllowedExtension'
        ]),
        getPrimaryNumber () {
            return numberFilter(this.seat.primary_number)
        },
        hasNameChanged () {
            return this.changes.name !== this.seat.display_name
        },
        hasExtensionChanged () {
            return this.changes.extension !== this.seat.pbx_extension
        },
        hasWebPasswordChanged () {
            return this.changes.webPassword !== this.seat.webpassword
        },
        hasAliasNumbersChanged () {
            return !_.isEqual(_.cloneDeep(this.changes.aliasNumbers).sort(), this.getAliasNumberIds().sort())
        },
        hasGroupsChanged () {
            return !_.isEqual(_.cloneDeep(this.changes.groups).sort(), _.cloneDeep(this.seat.pbx_group_ids).sort())
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
        }
    },
    watch: {
        seat () {
            this.changes = this.getSeatData()
        }
    },
    methods: {
        getAliasNumberIds () {
            const numberIds = []
            this.seat.alias_numbers.forEach((number) => {
                numberIds.push(number.number_id)
            })
            return numberIds
        },
        getGroupIds () {
            return _.clone(this.seat.pbx_group_ids)
        },
        getSoundSetId () {
            if (this.soundSet !== null) {
                return this.soundSet.id
            }
            return null
        },
        getSeatData () {
            return {
                name: this.seat.display_name,
                extension: this.seat.pbx_extension,
                aliasNumbers: this.getAliasNumberIds(),
                webPassword: this.seat.webpassword,
                clirIntrapbx: this.intraPbx,
                groups: this.getGroupIds(),
                soundSet: this.getSoundSetId()
            }
        },
        toggle () {
            if (this.expanded) {
                this.$emit('collapse')
            } else {
                this.$emit('expand')
            }
        },
        resetName () {
            this.changes.name = this.seat.display_name
        },
        resetExtension () {
            this.changes.extension = this.seat.pbx_extension
        },
        resetWebPassword () {
            this.changes.webPassword = this.seat.webpassword
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
        deleteSeat () {
            if (this.$refs.listItem) {
                this.$refs.listItem.closePopoverMenu()
            }
            this.$emit('remove')
        },
        jumpToCallQueue () {
            this.$emit('jump-to-call-queue', this.seat)
        },
        save () {
            if (this.hasNameChanged) {
                this.$emit('save-name', {
                    seatId: this.seat.id,
                    seatName: this.changes.name
                })
            }
            if (this.hasExtensionChanged) {
                this.$emit('save-extension', {
                    seatId: this.seat.id,
                    seatExtension: this.changes.extension
                })
            }
            if (this.hasWebPasswordChanged) {
                this.$emit('save-webpassword', {
                    seatId: this.seat.id,
                    seatWebPassword: this.changes.webpassword
                })
            }
            if (this.hasAliasNumbersChanged) {
                this.$emit('save-alias-numbers', {
                    seatId: this.seat.id,
                    assignedNumbers: _.difference(this.changes.aliasNumbers, this.getAliasNumberIds()),
                    unassignedNumbers: _.difference(this.getAliasNumberIds(), this.changes.aliasNumbers)
                })
            }
            if (this.hasGroupsChanged) {
                this.$emit('save-groups', {
                    seatId: this.seat.id,
                    groupIds: this.changes.groups
                })
            }
            if (this.hasSoundSetChanged) {
                this.$emit('save-sound-set', {
                    seatId: this.seat.id,
                    soundSetId: this.changes.soundSet
                })
            }
        },
        showPasswordDialog () {
            this.$q.dialog({
                component: CscDialogChangePassword,
                parent: this
            }).onOk((password) => {
                this.changeWebPassword(password)
            })
        },
        showSIPPasswordDialog () {
            this.$q.dialog({
                component: CscDialogChangePassword,
                title: this.$t('Change SIP Password'),
                passwordLabel: this.$t('SIP Password'),
                passwordConfirmLabel: this.$t('SIP Password confirm'),
                parent: this
            }).onOk((password) => {
                this.changeSIPPassword(password)
            })
        },
        async changeWebPassword (password) {
            await this.$store.dispatch('pbxSeats/setSeatWebPassword', {
                seatId: this.seat.id,
                seatWebPassword: password
            })
        },
        async changeSIPPassword (password) {
            await this.$store.dispatch('pbxSeats/setSeatSIPPassword', {
                seatId: this.seat.id,
                seatSIPPassword: password
            })
        },
        changeIntraPbx () {
            this.$emit('save-intra-pbx', {
                seatId: this.seat.id,
                intraPbx: this.changes.clirIntrapbx
            })
        }
    }
}
</script>
