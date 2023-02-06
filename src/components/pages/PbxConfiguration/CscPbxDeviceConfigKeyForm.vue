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
            ref="selectType"
            v-if="changes"
            v-model="changes.type"
            :disable="loading"
            emit-value
            map-options
            :label="$t('Lamp/Key')"
            :options="typeOptions"
            @input="keyTypeChanged"
        >
            <template
                v-slot:prepend
            >
                <q-icon
                    name="radio_button_checked"
                />
            </template>
        </q-select>
        <q-toggle
            v-if="showCustomNumberToggle"
            class="q-pt-md"
            v-model="hasTargetNumber"
            :label="$t('Use custom number')"
            :disable="loading"
            data-cy="pbxdevices-target_number"
            @input="targetNumberToggleChanged()"

        />
        <csc-pbx-auto-attendant-selection
            v-if="changes.type && !hasTargetNumber"
            :value="selectedKeySubscriber"
            :options="subscriberOptions"
            :disable="loading"
            @input="keySubscriberChanged"
        />
        <csc-input
            v-if="showCustomNumberToggle && hasTargetNumber"
            v-model="changes.target_number"
            :disable="loading"
            clearable
            dense
            hide-bottom-space
            hide-hint
            :error="$v.changes.target_number.$error"
            :error-message="targetNumberErrorMessage"
            :label="$t('Number')"
            @input="$v.changes.target_number.$touch"
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
                    :disable="($v.changes.$invalid && hasTargetNumber) || loading"
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
import _ from 'lodash'
import CscPbxAutoAttendantSelection from './CscPbxAutoAttendantSelection'
import CscInput from 'components/form/CscInput'
import CscListSpinner from 'components/CscListSpinner'
import { mapState } from 'vuex'
import {
    Platform
} from 'quasar'
import {
    required
} from 'vuelidate/lib/validators'
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
    validations: {
        changes: {
            target_number: {
                required,
                onlyChars: function (value) {
                    const regExpTargetNumber = new RegExp("^[*#0-9]*$");
                    return regExpTargetNumber.test(value)
                }
            }
        }
    },
    data () {
        return {
            keyData: this.getKeyData(),
            changes: this.getKeyData(),
            hasTargetNumber: this.selectedLine?.target_number ? true : false
        }
    },
    watch: {
        selectedLine () {
            this.changes = this.getKeyData()
            this.keyData = this.getKeyData()
            this.hasTargetNumber = this.selectedLine?.target_number ? true : false
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
                    icon: icon,
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
                } else {
                    return ''
                }
            }
            return ''
        },
        selectedKeySubscriber () {
            const unassignedItem = this.subscriberOptions[0]
            if (this.changes) {
                const selectedOption = this.subscriberOptions.find(opt => opt?.value === this.changes.subscriber_id)
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
            if (!this.$v.changes.target_number.required) {
                return this.$t('{field} is required', {
                    field: this.$t('Target number')
                })
            } else if (!this.$v.changes.target_number.onlyChars) {
                return this.$t('{field} must consist only of numeric characters or the symbols * or #.', {
                    field: this.$t('Target number')
                })
            } else {
                return ''
            }
        }
    },
    methods: {
        getKeyData () {
            if (this.selectedLine) {
                this.hasTargetNumber = this.selectedLine.target_number ? true : false
                return {
                    extension_unit: this.selectedLine.extension_unit,
                    key_num: this.selectedLine.key_num,
                    subscriber_id: this.selectedLine.subscriber_id,
                    linerange: this.selectedLine.linerange,
                    type: this.selectedLine.type,
                    target_number: this.selectedLine.target_number
                }
            } else {
                return {
                    extension_unit: 0,
                    key_num: this.selectedKey.index,
                    subscriber_id: null,
                    linerange: this.selectedKey.keySet.name,
                    type: null,
                    target_number: null
                }
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
        keySubscriberChanged ({ value: subscriberId}) {
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
            this.hasTargetNumber = this.selectedLine?.target_number ? true : false
        },
        onSave () {
            this.$emit('onSave', this.changes)
        }
    }
}
</script>