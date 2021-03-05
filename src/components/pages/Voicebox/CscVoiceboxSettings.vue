
<template>
    <q-list>
        <q-item>
            <q-item-section>
                <q-input
                    v-model="changes.pin"
                    :loading="pinRequesting"
                    :disable="pinRequesting"
                    :label="$t('Change PIN')"
                    :error="$v.changes.pin.$error"
                    :error-message="pinErrorMessage"
                    @keyup.enter="updatePin"
                    @input="$v.changes.pin.$touch"
                    @blur="$v.changes.pin.$touch"
                >
                    <template
                        v-slot:prepend
                    >
                        <q-icon
                            name="lock"
                        />
                    </template>
                    <template
                        v-if="changes.pin !== pin && !$v.changes.pin.$error"
                        v-slot:append
                    >
                        <q-btn
                            icon="check"
                            color="primary"
                            flat
                            dense
                            label="Save"
                            :disable="pinRequesting"
                            @click="updatePin"
                        />
                    </template>
                </q-input>
            </q-item-section>
        </q-item>
        <q-item>
            <q-item-section>
                <q-input
                    v-model="changes.email"
                    :loading="emailRequesting"
                    :disable="emailRequesting"
                    :label="$t('Change Email')"
                    :error="$v.changes.email.$error"
                    :error-message="emailErrorMessage"
                    @keyup.enter="updateEmail"
                    @input="$v.changes.email.$touch"
                    @blur="$v.changes.email.$touch"
                >
                    <template
                        v-slot:prepend
                    >
                        <q-icon
                            name="email"
                        />
                    </template>
                    <template
                        v-if="changes.email !== email && !$v.changes.email.$error"
                        v-slot:append
                    >
                        <q-btn
                            icon="check"
                            color="primary"
                            flat
                            dense
                            label="Save"
                            :disable="emailRequesting"
                            @click="updateEmail"
                        />
                    </template>
                </q-input>
            </q-item-section>
        </q-item>
        <q-item>
            <q-item-section>
                <q-toggle
                    v-model="changes.attach"
                    :class="attachClasses"
                    :loading="attachRequesting"
                    :disable="attachRequesting"
                    :label="attachLabel"
                    checked-icon="attach_file"
                    unchecked-icon="attach_file"
                    @input="toggleAttach"
                />
            </q-item-section>
        </q-item>
        <q-item>
            <q-item-section>
                <q-toggle
                    v-model="changes.delete"
                    :class="deleteClasses"
                    :loading="deleteRequesting || !canToggleDelete"
                    :disable="deleteRequesting || !canToggleDelete"
                    :label="deleteLabel"
                    checked-icon="delete"
                    unchecked-icon="delete"
                    @input="toggleDelete"
                />
            </q-item-section>
        </q-item>
    </q-list>
</template>

<script>
import {
    showGlobalError
} from 'src/helpers/ui'
import {
    maxLength,
    numeric,
    email
} from 'vuelidate/lib/validators'

export default {
    name: 'CscVoiceboxSettings',
    props: {
        deleteRequesting: {
            type: Boolean,
            default: false
        },
        attachRequesting: {
            type: Boolean,
            default: false
        },
        pinRequesting: {
            type: Boolean,
            default: false
        },
        emailRequesting: {
            type: Boolean,
            default: false
        },
        attachLabel: {
            type: String,
            default: ''
        },
        deleteLabel: {
            type: String,
            default: ''
        },
        attach: {
            type: Boolean,
            default: false
        },
        delete: {
            type: Boolean,
            default: false
        },
        pin: {
            type: String,
            default: ''
        },
        email: {
            type: String,
            default: ''
        }
    },
    data () {
        return {
            changes: this.getSettings()
        }
    },
    validations: {
        changes: {
            pin: {
                maxLength: maxLength(64),
                numeric
            },
            email: {
                email
            }
        }
    },
    computed: {
        pinErrorMessage () {
            if (!this.$v.changes.pin.maxLength) {
                return this.$t('{field} must have at most {maxLength} letters', {
                    field: this.$t('PIN'),
                    maxLength: this.$v.changes.pin.$params.maxLength.max
                })
            } else if (!this.$v.changes.pin.numeric) {
                return this.$t('{field} must consist of numeric characters only', {
                    field: this.$t('PIN')
                })
            } else {
                return ''
            }
        },
        emailErrorMessage () {
            return this.$t('Input a valid email address')
        },
        canToggleDelete () {
            return this.attach
        },
        pinHasChanged () {
            return this.changes.pin !== this.pin
        },
        emailHasChanged () {
            return this.changes.email !== this.email
        },
        pinButtons () {
            const buttons = []
            const self = this
            if (this.pinHasChanged && this.$v.changes.pin.$error) {
                buttons.push({
                    icon: 'clear',
                    error: true,
                    handler (event) {
                        event.stopPropagation()
                        self.resetFields()
                    }
                }
                )
            } else if (this.pinHasChanged) {
                buttons.push({
                    icon: 'check',
                    error: false,
                    handler (event) {
                        event.stopPropagation()
                        self.updatePin()
                    }
                }, {
                    icon: 'clear',
                    error: false,
                    handler (event) {
                        event.stopPropagation()
                        self.resetFields()
                    }
                }
                )
            }
            return buttons
        },
        emailButtons () {
            const buttons = []
            const self = this
            if (this.emailHasChanged && this.$v.changes.email.$error) {
                buttons.push({
                    icon: 'clear',
                    error: true,
                    handler (event) {
                        event.stopPropagation()
                        self.resetFields()
                    }
                }
                )
            } else if (this.emailHasChanged) {
                buttons.push({
                    icon: 'check',
                    error: false,
                    handler (event) {
                        event.stopPropagation()
                        self.updateEmail()
                    }
                }, {
                    icon: 'clear',
                    error: false,
                    handler (event) {
                        event.stopPropagation()
                        self.resetFields()
                    }
                }
                )
            }
            return buttons
        },
        attachClasses () {
            const classes = []
            if (this.attach) {
                classes.push('csc-toggle-enabled')
            } else {
                classes.push('csc-toggle-disabled')
            }
            return classes
        },
        deleteClasses () {
            const classes = []
            if (this.delete) {
                classes.push('csc-toggle-enabled')
            } else {
                classes.push('csc-toggle-disabled')
            }
            return classes
        }
    },
    watch: {
        pin () {
            this.changes.pin = this.pin
        },
        delete () {
            this.changes.delete = this.delete
        },
        attach () {
            this.changes.attach = this.attach
        },
        email () {
            this.changes.email = this.email
        }
    },
    methods: {
        getSettings () {
            return {
                delete: this.delete,
                attach: this.attach,
                pin: this.pin,
                email: this.email
            }
        },
        resetFields () {
            this.changes = this.getSettings()
        },
        toggleDelete () {
            this.$store.dispatch('voicebox/toggleDelete')
        },
        toggleAttach () {
            this.$store.dispatch('voicebox/toggleAttach')
        },
        updatePin () {
            if (this.pinHasChanged && !this.$v.changes.pin.$error) {
                this.$store.dispatch('voicebox/updatePin', this.changes.pin)
            } else {
                showGlobalError(this.$t('Input a valid PIN'))
            }
        },
        updateEmail () {
            if (this.emailHasChanged && !this.$v.changes.email.$error) {
                this.$store.dispatch('voicebox/updateEmail', this.changes.email)
            } else {
                showGlobalError(this.$t('Input a valid email address'))
            }
        }
    }
}
</script>

<style lang="stylus" rel="stylesheet/stylus">
</style>
