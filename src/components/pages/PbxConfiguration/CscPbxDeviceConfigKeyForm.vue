<template>
    <div>
        <div
            class="csc-device-key-title row justify-center items-center"
        >
            <q-icon
                class="csc-device-key-title-icon"
                name="touch_app"
                size="24px"
            />
            <div
                class="column"
            >
                <div
                    class="csc-device-key-title-main"
                >
                    {{ selectedKeySetName }}: {{ $t('Lamp/Key') }} {{ selectedKeyNumber }}
                </div>
            </div>
        </div>
        <q-select
            v-if="changes"
            ref="selectType"
            v-model="changes.type"
            :disable="loading"
            emit-value
            map-options
            :label="$t('Lamp/Key')"
            :options="typeOptions"
            @update:model-value="keyTypeChanged"
        >
            <template
                #prepend
            >
                <q-icon
                    name="radio_button_checked"
                />
            </template>
        </q-select>
        <q-toggle
            v-if="showCustomNumberToggle"
            v-model="hasTargetNumber"
            class="q-pt-md"
            :label="$t('Use custom number')"
            :disable="loading"
            data-cy="pbxdevices-target_number"
            @update:model-value="targetNumberToggleChanged()"
        />
        <csc-pbx-auto-attendant-selection
            v-if="changes.type && !hasTargetNumber"
            v-model="selectedKeySubscriber"
            :options="subscriberOptions"
            :disable="loading"
            @update:model-value="keySubscriberChanged"
        />
        <csc-input
            v-if="showCustomNumberToggle && hasTargetNumber"
            v-model="changes.target_number"
            :disable="loading"
            clearable
            dense
            hide-bottom-space
            hide-hint
            :error="v$.changes.target_number.$errors.length > 0"
            :error-message="targetNumberErrorMessage"
            :label="$t('Number')"
            @update:model-value="v$.changes.target_number.$touch()"
        />
        <csc-list-spinner
            v-if="loading"
        />
        <div
            class="row justify-center actions"
        >
            <div
                class="row"
            >
                <q-btn
                    flat
                    icon="clear"
                    color="white"
                    :big="isMobile"
                    :disable="loading"
                    @click="closeKeyOverlay()"
                >
                    {{ $t('Close') }}
                </q-btn>
                <q-btn
                    v-if="hasTypeChanged || hasSubscriberChanged || hasTargetNumberChanged"
                    flat
                    icon="undo"
                    color="white"
                    :disable="loading"
                    @click="resetData()"
                >
                    {{ $t('Reset') }}
                </q-btn>
                <q-btn
                    v-if="hasTypeChanged || hasSubscriberChanged || hasTargetNumberChanged"
                    :label="$t('Save')"
                    :disable="(v$.changes.$invalid && hasTargetNumber) || loading"
                    flat
                    color="primary"
                    icon="check"
                    @click="onSave"
                />
            </div>
        </div>
    </div>
</template>

<script>
import useValidate from '@vuelidate/core'
import { required } from '@vuelidate/validators'
import CscListSpinner from 'components/CscListSpinner'
import CscInput from 'components/form/CscInput'
import CscPbxAutoAttendantSelection from 'components/pages/PbxConfiguration/CscPbxAutoAttendantSelection'
import _ from 'lodash'
import { Platform } from 'quasar'
import { mapState } from 'vuex'

export default {
    name: 'CscPbxDeviceConfigKeyForm',
    components: {
        CscPbxAutoAttendantSelection,
        CscInput,
        CscListSpinner
    },
    props: {
        selectedLine: {
            type: Object,
            default: null
        },
        selectedKey: {
            type: Object,
            default: null
        },
        subscriberMap: {
            type: Object,
            default: null
        },
        loading: {
            type: Boolean,
            default: false
        }
    },
    emits: ['onSave', 'closeKeyOverlay'],
    validations: {
        changes: {
            target_number: {
                required,
                onlyChars: function (value) {
                    // eslint-disable-next-line prefer-regex-literals
                    const regExpTargetNumber = new RegExp('^[*#0-9+]*$')
                    return regExpTargetNumber.test(value)
                }
            }
        }
    },
    data () {
        return {
            keyData: this.getKeyData(),
            changes: this.getKeyData(),
            hasTargetNumber: !!this.selectedLine?.target_number,
            v$: useValidate()
        }
    },
    computed: {
        ...mapState('pbx', [
            'subscriberList'
        ]),
        hasSubscriberChanged () {
            return this.keyData.subscriber_id !== this.changes.subscriber_id
        },
        hasTypeChanged () {
            return this.keyData.type !== this.changes.type
        },
        hasTargetNumberChanged () {
            return this.keyData.target_number !== this.changes.target_number
        },
        subscriberOptions () {
            const options = []
            this.subscriberList.forEach((subscriber) => {
                let icon = 'person'
                let subscriberTypeTitle = this.$t('Seat')
                if (subscriber.is_pbx_group) {
                    icon = 'group'
                    subscriberTypeTitle = this.$t('Group')
                } else if (subscriber.is_pbx_pilot) {
                    icon = 'person_outline'
                    subscriberTypeTitle = this.$t('Pilot')
                }
                options.push({
                    label: subscriber.display_name || subscriber.webusername,
                    icon,
                    value: subscriber.id,
                    subscriberTypeTitle
                })
            })
            return options
        },
        selectedKeyIcon () {
            if (this.selectedLine !== null) {
                const subscriber = this.subscriberMap[this.selectedLine.subscriber_id]
                if (subscriber !== null && subscriber.is_pbx_pilot === true) {
                    return 'person_outline'
                } else if (subscriber !== null && subscriber.is_pbx_group === true) {
                    return 'group'
                } else if (subscriber !== null) {
                    return 'person'
                }
                return ''
            }
            return ''
        },
        selectedKeySubscriber () {
            const unassignedItem = this.subscriberOptions[0]
            if (this.changes) {
                const selectedOption = this.subscriberOptions.find((opt) => opt?.value === this.changes.subscriber_id)
                return selectedOption || unassignedItem
            }
            return unassignedItem
        },
        selectedKeySetName () {
            if (this.selectedLine !== null) {
                return this.selectedLine.linerange
            }
            return ''
        },
        selectedKeyNumber () {
            if (this.selectedLine !== null) {
                return (this.selectedLine.key_num + 1)
            }
            return ''
        },
        typeOptions () {
            const options = []
            options.push({
                label: this.$t('N/A'),
                value: null
            })
            if (this.selectedKey !== null && this.selectedKey.keySet.can_blf) {
                options.push({
                    label: this.$t('Busy Lamp Field'),
                    value: 'blf'
                })
            }
            if (this.selectedKey !== null && this.selectedKey.keySet.can_private) {
                options.push({
                    label: this.$t('Private'),
                    value: 'private'
                })
            }
            if (this.selectedKey !== null && this.selectedKey.keySet.can_shared) {
                options.push({
                    label: this.$t('Shared'),
                    value: 'shared'
                })
            }
            if (this.selectedKey !== null && this.selectedKey.keySet.can_speeddial) {
                options.push({
                    label: this.$t('Speed Dial'),
                    value: 'speeddial'
                })
            }
            if (this.selectedKey !== null && this.selectedKey.keySet.can_forward) {
                options.push({
                    label: this.$t('Forward'),
                    value: 'forward'
                })
            }
            if (this.selectedKey !== null && this.selectedKey.keySet.can_transfer) {
                options.push({
                    label: this.$t('Transfer'),
                    value: 'transfer'
                })
            }
            return options
        },
        isMobile () {
            return Platform.is.mobile
        },
        showCustomNumberToggle () {
            return this.changes.type === 'transfer' || this.changes.type === 'speeddial' || this.changes.type === 'forward'
        },
        targetNumberErrorMessage () {
            const errorsTab = this.v$.changes.target_number.$errors
            if (errorsTab && errorsTab.length > 0 && errorsTab[0].$validator === 'required') {
                return this.$t('{field} is required', {
                    field: this.$t('Target number')
                })
            } else if (errorsTab && errorsTab.length > 0 && errorsTab[0].$validator === 'onlyChars') {
                return this.$t('{field} must consist only of numeric characters or the symbols +, * or #.', {
                    field: this.$t('Target number')
                })
            }
            return ''
        }
    },
    watch: {
        selectedLine () {
            this.changes = this.getKeyData()
            this.keyData = this.getKeyData()
            this.hasTargetNumber = !!this.selectedLine?.target_number
        }
    },
    methods: {
        getKeyData () {
            if (this.selectedLine) {
                this.hasTargetNumber = !!this.selectedLine.target_number
                return {
                    extension_unit: this.selectedLine.extension_unit,
                    key_num: this.selectedLine.key_num,
                    subscriber_id: this.selectedLine.subscriber_id,
                    linerange: this.selectedLine.linerange,
                    type: this.selectedLine.type,
                    target_number: this.selectedLine.target_number
                }
            }
            return {
                extension_unit: 0,
                key_num: this.selectedKey.index,
                subscriber_id: null,
                linerange: this.selectedKey.keySet.name,
                type: null,
                target_number: null
            }
        },
        closeKeyOverlay () {
            this.$emit('closeKeyOverlay')
        },
        keyTypeChanged () {
            if (this.changes.type !== null && this.changes.subscriber_id === null) {
                const pbxPilot = this.subscriberList.find((subscriber) => subscriber.is_pbx_pilot)
                this.changes.subscriber_id = pbxPilot ? pbxPilot.id : this.subscriberList[0].id
            }
            if (this.changes.type === null) {
                this.changes.subscriber_id = null
                this.changes.target_number = null
                this.hasTargetNumber = false
            }
            if (!this.showCustomNumberToggle) {
                this.changes.target_number = null
                this.hasTargetNumber = false
            }
        },
        keySubscriberChanged ({ value: subscriberId }) {
            this.changes.subscriber_id = subscriberId
        },
        targetNumberToggleChanged () {
            if (!this.hasTargetNumber) {
                this.changes.target_number = null
            } else {
                const pbxPilot = this.subscriberList.find((subscriber) => subscriber.is_pbx_pilot)
                this.changes.subscriber_id = pbxPilot ? pbxPilot.id : this.subscriberList[0].id
            }
        },
        resetData () {
            this.changes = _.clone(this.keyData)
            this.hasTargetNumber = !!this.selectedLine?.target_number
        },
        onSave () {
            this.$emit('onSave', this.changes)
        }
    }
}
</script>
