<template>
    <div>
        <div
            class="row justify-center q-gutter-x-sm"
        >
            <div
                class="col-xs-12 col-lg-3"
            >
                <csc-input
                    v-model="data.displayName"
                    clearable
                    autofocus
                    dense
                    hide-bottom-space
                    :error="v$.data.displayName.$errors.length > 0"
                    :error-message="seatDisplayNameErrorMessage"
                    :disable="loading"
                    :readonly="loading"
                    :label="$t('Display Name')"
                    @blur="v$.data.displayName.$touch()"
                    @update:model-value="v$.data.displayName.$touch()"
                >
                    <template
                        #prepend
                    >
                        <q-icon
                            name="person"
                        />
                    </template>
                </csc-input>
                <csc-input
                    v-model="data.extension"
                    clearable
                    dense
                    hide-bottom-space
                    :error="v$.data.extension.$errors.length > 0"
                    :error-message="extensionErrorMessage"
                    :disable="loading"
                    :readonly="loading"
                    :label="$t('Extension')"
                    :hint="getExtensionHint"
                    @blur="v$.data.extension.$touch()"
                    @update:model-value="v$.data.extension.$touch()"
                >
                    <template
                        #prepend
                    >
                        <q-icon
                            name="call"
                        />
                    </template>
                </csc-input>
                <q-checkbox
                    v-model="data.forceCli"
                    emit-value
                    :disable="loading"
                    :readonly="loading"
                    :label="$t('Force CLI')"
                    :left-label="true"
                />
                <q-select
                    v-model="data.aliasNumbers"
                    clearable
                    dense
                    multiple
                    use-chips
                    emit-value
                    map-options
                    :disable="loading"
                    :readonly="loading"
                    :label="$t('Alias Numbers')"
                    :options="aliasNumberOptions"
                />
                <q-select
                    v-model="data.groups"
                    clearable
                    dense
                    multiple
                    use-chips
                    emit-value
                    map-options
                    :disable="loading"
                    :readonly="loading"
                    :label="$t('Groups')"
                    :options="groupOptions"
                >
                    <template
                        #prepend
                    >
                        <q-icon
                            name="group"
                        />
                    </template>
                </q-select>
                <q-select
                    v-model="data.soundSet"
                    radio
                    dense
                    emit-value
                    map-options
                    :disable="loading"
                    :readonly="loading"
                    :label="$t('Sound Set')"
                    :options="soundSetOptions"
                >
                    <template
                        #prepend
                    >
                        <q-icon
                            name="queue_music"
                        />
                    </template>
                </q-select>
                <q-toggle
                    v-model="data.clirIntrapbx"
                    :label="$t('Hide number within own PBX')"
                    :disable="loading"
                    class="q-pa-md"
                    dense
                />
            </div>
            <div
                class="col-xs-12 col-lg-3"
            >
                <csc-input
                    v-model="data.webUsername"
                    clearable
                    dense
                    hide-bottom-space
                    :error="v$.data.webUsername.$errors.length > 0"
                    :error-message="seatWebUsernameErrorMessage"
                    :disable="loading"
                    :readonly="loading"
                    :label="$t('Web Username')"
                    @blur="v$.data.webUsername.$touch()"
                    @update:model-value="v$.data.webUsername.$touch()"
                >
                    <template
                        #prepend
                    >
                        <q-icon
                            name="person"
                        />
                    </template>
                </csc-input>
                <csc-input-password-retype
                    v-model="data.password"
                    :password-label="$t('Web Password')"
                    :password-confirm-label="$t('Web Password confirm')"
                    :disable="loading"
                    hide-bottom-space
                    dense
                    @validation-failed="webPasswordReady=false"
                    @validation-succeeded="webPasswordReady=true"
                />
                <csc-input
                    v-model="data.sipUsername"
                    clearable
                    dense
                    hide-bottom-space
                    :error="v$.data.sipUsername.$errors.length > 0"
                    :error-message="seatSipUsernameErrorMessage"
                    :disable="loading"
                    :readonly="loading"
                    :label="$t('SIP Username')"
                    @blur="v$.data.sipUsername.$touch()"
                    @update:model-value="v$.data.sipUsername.$touch()"
                >
                    <template
                        #prepend
                    >
                        <q-icon
                            name="person"
                        />
                    </template>
                </csc-input>
                <csc-input-password-retype
                    v-model="data.sipPassword"
                    :password-label="$t('SIP Password')"
                    :password-confirm-label="$t('SIP Password confirm')"
                    :password-type="'sip'"
                    :disable="loading"
                    dense
                    @validation-failed="sipPasswordReady=false"
                    @validation-succeeded="sipPasswordReady=true"
                />
            </div>
        </div>
        <div
            class="row justify-center"
        >
            <q-btn
                flat
                color="default"
                icon="clear"
                :disable="loading"
                :label="$t('Cancel')"
                @click="cancel()"
            />
            <q-btn
                flat
                color="primary"
                icon="person"
                :loading="loading"
                :disable="disableSaveButton()"
                :label="$t('Create seat')"
                @click="save()"
            />
        </div>
    </div>
</template>

<script>
import useValidate from '@vuelidate/core'
import { maxLength, numeric, required } from '@vuelidate/validators'
import CscInput from 'components/form/CscInput'
import CscInputPasswordRetype from 'components/form/CscInputPasswordRetype'
import { inRange } from 'src/helpers/validation'
import { mapGetters } from 'vuex'
export default {
    name: 'CscPbxSeatAddForm',
    components: {
        CscInputPasswordRetype,
        CscInput
    },
    props: {
        loading: {
            type: Boolean,
            default: false
        },
        aliasNumberOptions: {
            type: Array,
            default: () => []
        },
        groupOptions: {
            type: Array,
            default: () => []
        },
        soundSetOptions: {
            type: Array,
            default: () => []
        }
    },
    emits: ['save', 'cancel'],
    validations: {
        data: {
            displayName: {
                required,
                maxLength: maxLength(64)
            },
            sipUsername: {
                required,
                maxLength: maxLength(64),
                noWhiteSpace: (value) =>
                    // eslint-disable-next-line prefer-regex-literals
                    new RegExp(/\s/).test(value) === false
            },
            webUsername: {
                required,
                maxLength: maxLength(64)
            },
            extension: {
                required,
                numeric,
                maxLength: maxLength(64),
                isInRange: function (value) {
                    return inRange(value, this.getMinAllowedExtension, this.getMaxAllowedExtension)
                }
            }
        }
    },
    data () {
        return {
            webPasswordReady: false,
            sipPasswordReady: false,
            data: this.getDefaults(),
            v$: useValidate()
        }
    },
    computed: {
        ...mapGetters('pbx', [
            'getExtensionHint',
            'getMinAllowedExtension',
            'getMaxAllowedExtension'
        ]),
        seatDisplayNameErrorMessage () {
            const errorsTab = this.v$.data.displayName.$errors
            if (errorsTab && errorsTab.length > 0 && errorsTab[0].$validator === 'required') {
                return this.$t('{field} is required', {
                    field: this.$t('Seat Display Name')
                })
            } else if (errorsTab && errorsTab.length > 0 && errorsTab[0].$validator === 'maxLength') {
                return this.$t('{field} must have at most {maxLength} letters', {
                    field: this.$t('Seat Display Name'),
                    maxLength: this.v$.data.displayName.maxLength.$params.max
                })
            }
            return ''
        },
        seatWebUsernameErrorMessage () {
            const errorsTab = this.v$.data.webUsername.$errors
            if (errorsTab && errorsTab.length > 0 && errorsTab[0].$validator === 'required') {
                return this.$t('{field} is required', {
                    field: this.$t('Seat Web Username')
                })
            } else if (errorsTab && errorsTab.length > 0 && errorsTab[0].$validator === 'maxLength') {
                return this.$t('{field} must have at most {maxLength} letters', {
                    field: this.$t('Seat Web Username'),
                    maxLength: this.v$.data.webUsername.maxLength.$params.max
                })
            }
            return ''
        },
        seatSipUsernameErrorMessage () {
            const errorsTab = this.v$.data.sipUsername.$errors
            if (errorsTab && errorsTab.length > 0 && errorsTab[0].$validator === 'required') {
                return this.$t('SIP Username is required', {
                    field: this.$t('Seat SIP Username')
                })
            } else if (errorsTab && errorsTab.length > 0 && errorsTab[0].$validator === 'maxLength') {
                return this.$t('SIP Username must have at most {maxLength} letters', {
                    field: this.$t('Seat SIP Username'),
                    maxLength: this.v$.data.sipUsername.maxLength.$params.max
                })
            } else if (errorsTab && errorsTab.length > 0 && errorsTab[0].$validator === 'noWhiteSpace') {
                return this.$t('SIP Username must not contain any space character', {
                    field: this.$t('Seat SIP Username'),
                    maxLength: this.v$.data.sipUsername.maxLength.$params.max
                })
            }
            return ''
        },
        extensionErrorMessage () {
            const errorsTab = this.v$.data.extension.$errors
            if (errorsTab && errorsTab.length > 0 && errorsTab[0].$validator === 'required') {
                return this.$t('{field} is required', {
                    field: this.$t('Extension')
                })
            } else if (errorsTab && errorsTab.length > 0 && errorsTab[0].$validator === 'maxLength') {
                return this.$t('{field} must have at most {maxLength} letters', {
                    field: this.$t('Extension'),
                    maxLength: this.v$.data.extension.maxLength.$params.max
                })
            } else if (errorsTab && errorsTab.length > 0 && errorsTab[0].$validator === 'numeric') {
                return this.$t('{field} must consist of numeric characters only', {
                    field: this.$t('Extension')
                })
            } else if (errorsTab && errorsTab.length > 0 && errorsTab[0].$validator === 'isInRange') {
                return this.getExtensionHint
            }
            return ''
        }
    },
    created () {
        if (this.defaultSoundSet) {
            this.soundSet = this.defaultSoundSet
        }
    },
    methods: {
        getDefaults () {
            return {
                displayName: '',
                sipUsername: '',
                webUsername: '',
                extension: '',
                forceCli: false,
                password: {
                    password: '',
                    passwordRetype: ''
                },
                sipPassword: {
                    password: '',
                    passwordRetype: ''
                },
                aliasNumbers: [],
                groups: [],
                soundSet: null,
                clirIntrapbx: false
            }
        },
        cancel () {
            this.$emit('cancel')
        },
        arePasswordsValid () {
            return this.webPasswordReady && this.sipPasswordReady
        },
        disableSaveButton () {
            return this.v$.data.$invalid || this.loading || !this.arePasswordsValid()
        },
        save () {
            this.$emit('save', {
                displayName: this.data.displayName,
                sipUsername: this.data.sipUsername,
                webUsername: this.data.webUsername,
                extension: this.data.extension,
                forceCli: this.data.forceCli,
                webPassword: this.data.password.password,
                sipPassword: this.data.sipPassword.password,
                aliasNumbers: this.data.aliasNumbers,
                groups: this.data.groups,
                soundSet: this.data.soundSet,
                clirIntrapbx: this.data.clirIntrapbx
            })
        },
        reset () {
            this.data = this.getDefaults()
            this.v$.$reset()
        }
    }
}
</script>

<style lang="sass" rel="stylesheet/sass">
.Password__strength-meter
    margin-top: 20px !important
.Password__strength-meter:after,
.Password__strength-meter:before
    border-color: #3b3440 !important
.Password
    max-width: 100%
</style>
