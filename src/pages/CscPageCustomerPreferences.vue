<template>
    <csc-page
        id="csc-page-customer-preferences"
        class="q-pa-lg row"
    >
        <q-list
            v-if="changes"
            class="col col-xs-12 col-md-5"
        >
            <q-item>
                <q-item-section>
                    <q-toggle
                        v-model="changes.ignore_cf_when_hunting"
                        class="q-pa-sm"
                        :label="$t('Ignore Members Call Forwards when Hunting')"
                        @update:model-value="ignoreMembers"
                    />
                </q-item-section>
            </q-item>
            <q-item>
                <q-item-section>
                    <q-toggle
                        v-model="changes.block_in_mode"
                        class="q-pa-sm"
                        :label="$t('Block Mode for inbound calls')"
                        @update:model-value="blockInMode"
                    />
                </q-item-section>
            </q-item>
            <q-item>
                <q-item-section>
                    <csc-input-chips
                        :value="changes.block_in_list"
                        :label="$t('Block List for inbound calls')"
                        :emit-array="true"
                        dense
                        @input="setPreferenceInboundEvent($event)"
                    />
                </q-item-section>
            </q-item>
            <q-item>
                <q-item-section>
                    <q-toggle
                        v-model="changes.block_in_clir"
                        class="q-pa-sm"
                        :label="$t('Block anonymous inbound calls')"
                        @update:model-value="blockInClir"
                    />
                </q-item-section>
            </q-item>
            <q-item>
                <q-item-section>
                    <q-toggle
                        v-model="changes.block_out_mode"
                        class="q-pa-sm"
                        :label="$t('Block Mode for outbounds calls')"
                        @update:model-value="blockOutMode"
                    />
                </q-item-section>
            </q-item>
            <q-item>
                <q-item-section>
                    <csc-input-chips
                        :value="changes.block_out_list"
                        :label="$t('Block List for outbounds calls')"
                        :emit-array="true"
                        dense
                        @input="setPreferenceOutboundEvent($event)"
                    />
                </q-item-section>
            </q-item>
            <q-item>
                <q-item-section>
                    <q-input
                        v-model.trim="changes.block_out_override_pin"
                        :label="$t('PIN to bypass outbound Block List')"
                        clearable
                        hide-bottom-space
                        :error="v$.changes.block_out_override_pin.$errors.length > 0"
                        :error-message="$errMsg(v$.changes.block_out_override_pin.$errors)"
                        @keyup.enter="save"
                    >
                        <template
                            v-if="hasBlockOutOverridePinChanged"
                            #append
                        >
                            <csc-input-button-save
                                @click.stop="save"
                            />
                            <csc-input-button-reset
                                @click.stop="resetBlockOutOverridePin"
                            />
                        </template>
                    </q-input>
                </q-item-section>
            </q-item>
            <q-item>
                <q-item-section>
                    <q-toggle
                        v-model="changes.play_announce_before_call_setup"
                        class="q-pa-sm"
                        :label="$t('Play announcement before call setup')"
                        @update:model-value="playAnnounceBeforeCallSetup"
                    />
                </q-item-section>
            </q-item>
            <q-item>
                <q-item-section>
                    <q-toggle
                        v-model="changes.play_announce_to_callee"
                        class="q-pa-sm"
                        :label="$t('Play announcement to callee after answer')"
                        @update:model-value="playAnnounceToCallee"
                    />
                </q-item-section>
            </q-item>
        </q-list>
    </csc-page>
</template>

<script>
import useValidate from '@vuelidate/core'
import { integer } from '@vuelidate/validators'
import CscInputChips from 'components/CscInputChips'
import CscPage from 'components/CscPage'
import CscInputButtonReset from 'components/form/CscInputButtonReset'
import CscInputButtonSave from 'components/form/CscInputButtonSave'
import _ from 'lodash'
import { showGlobalError } from 'src/helpers/ui'
import { RequestState } from 'src/store/common'
import {
    mapActions,
    mapGetters,
    mapMutations,
    mapState
} from 'vuex'
export default {
    name: 'CscPageCustomerPreferences',
    components: {
        CscPage,
        CscInputChips,
        CscInputButtonReset,
        CscInputButtonSave
    },
    data () {
        return {
            v$: useValidate(),
            changes: null,
            inputValue: '',
            items: []
        }
    },
    validations () {
        return {
            changes: {
                block_out_override_pin: {
                    integer
                }
            }
        }
    },
    computed: {
        ...mapGetters('user', [
            'getCustomerId'
        ]),
        ...mapState('customer', [
            'customerPreferences',
            'customerPreferencesSelected',
            'customerPreferencesLoadingState',
            'customerPreferencesError'
        ]),
        hasBlockOutOverridePinChanged () {
            return this.changes.block_out_override_pin !== this.customerPreferences.block_out_override_pin
        }
    },
    watch: {
        customerPreferences () {
            this.changes = this.getCustomerPreferencesData()
        },
        customerPreferencesLoadingState (state) {
            if (state === RequestState.failed) {
                showGlobalError(this.customerPreferencesError)
            }
        }
    },
    mounted () {
        this.loadCustomerPreferences(this.getCustomerId)
        this.expandCustomerPreferences()
    },
    methods: {
        ...mapActions('customer', [
            'loadCustomerPreferences',
            'updateIgnoreMembers',
            'updateBlockInList',
            'updateBlockInMode',
            'updateBlockInClir',
            'updateBlockOutMode',
            'updateBlockOutList',
            'updateBlockOutOverridePin',
            'updatePlayAnnounceBeforeCallSetup',
            'updatePlayAnnounceToCallee'
        ]),
        ...mapMutations('customer', [
            'expandCustomerPreferences'
        ]),
        getCustomerPreferencesData () {
            return (this.customerPreferences)
                ? {
                    ignore_cf_when_hunting: this.customerPreferences.ignore_cf_when_hunting ? this.customerPreferences.ignore_cf_when_hunting : false,
                    block_in_mode: this.customerPreferences.block_in_mode ? this.customerPreferences.block_in_mode : false,
                    block_in_clir: this.customerPreferences.block_in_clir ? this.customerPreferences.block_in_clir : false,
                    block_out_mode: this.customerPreferences.block_out_mode ? this.customerPreferences.block_out_mode : false,
                    play_announce_before_call_setup: this.customerPreferences.play_announce_before_call_setup ? this.customerPreferences.play_announce_before_call_setup : false,
                    play_announce_to_callee: this.customerPreferences.play_announce_to_callee ? this.customerPreferences.play_announce_to_callee : false,
                    block_out_override_pin: this.customerPreferences.block_out_override_pin ? this.customerPreferences.block_out_override_pin : undefined,
                    block_in_list: this.customerPreferences.block_in_list ? this.customerPreferences.block_in_list : [],
                    block_out_list: this.customerPreferences.block_out_list ? this.customerPreferences.block_out_list : []
                }
                : null
        },
        ignoreMembers () {
            this.updateIgnoreMembers({
                customerId: this.getCustomerId,
                ignore_cf: this.changes.ignore_cf_when_hunting
            })
        },
        blockInMode () {
            this.updateBlockInMode({
                customerId: this.getCustomerId,
                block_in_mode: this.changes.block_in_mode
            })
        },
        blockInClir () {
            this.updateBlockInClir({
                customerId: this.getCustomerId,
                block_in_clir: this.changes.block_in_clir
            })
        },
        blockOutMode () {
            this.updateBlockOutMode({
                customerId: this.getCustomerId,
                block_out_mode: this.changes.block_out_mode
            })
        },
        playAnnounceBeforeCallSetup () {
            this.updatePlayAnnounceBeforeCallSetup({
                customerId: this.getCustomerId,
                play_announce_before_call_setup: this.changes.play_announce_before_call_setup
            })
        },
        playAnnounceToCallee () {
            this.updatePlayAnnounceToCallee({
                customerId: this.getCustomerId,
                play_announce_to_callee: this.changes.play_announce_to_callee
            })
        },
        add (value) {
            if (value !== undefined && value !== null && value !== '') {
                this.items.push(value.trim())
                this.inputValue = ''
            }
        },
        removeAll () {
            if (this.items && this.items.length > 0) {
                this.items = []
            }
        },
        remove (index) {
            this.items.splice(index, 1)
        },
        setPreferenceInboundEvent (value) {
            let trimmedValue = value
            if (_.isString(value)) {
                trimmedValue = _.trim(value)
            }
            this.updateBlockInList({
                customerId: this.getCustomerId,
                block_in_list: trimmedValue
            })
        },
        setPreferenceOutboundEvent (value) {
            let trimmedValue = value
            if (_.isString(value)) {
                trimmedValue = _.trim(value)
            }
            this.updateBlockOutList({
                customerId: this.getCustomerId,
                block_out_list: trimmedValue
            })
        },
        resetBlockOutOverridePin () {
            this.changes.block_out_override_pin = this.customerPreferences.block_out_override_pin
        },
        save () {
            let isValid = true
            this.v$.changes.block_out_override_pin.$touch()
            isValid = !this.v$.changes.block_out_override_pin.$error
            if (isValid) {
                if (this.hasBlockOutOverridePinChanged) {
                    this.updateBlockOutOverridePin({
                        customerId: this.getCustomerId,
                        block_out_override_pin: this.changes.block_out_override_pin
                    })
                }
            }
        }
    }
}
</script>
