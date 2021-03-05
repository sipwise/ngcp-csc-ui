<template>
    <div>
        <div
            class="row justify-center q-gutter-x-sm"
        >
            <div
                class="col-xs-12 col-lg-3"
            >
                <csc-input
                    v-model="data.name"
                    clearable
                    autofocus
                    dense
                    hide-bottom-space
                    :error="$v.data.name.$error"
                    :error-message="seatNameErrorMessage"
                    :disable="loading"
                    :readonly="loading"
                    :label="$t('Name')"
                    @input="$v.data.name.$touch"
                >
                    <template
                        v-slot:prepend
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
                    hide-hint
                    :error="$v.data.extension.$error"
                    :error-message="extensionErrorMessage"
                    :disable="loading"
                    :readonly="loading"
                    :label="$t('Extension')"
                    :hint="getExtensionHint"
                    @input="$v.data.extension.$touch"
                >
                    <template
                        v-slot:prepend
                    >
                        <q-icon
                            name="call"
                        />
                    </template>
                </csc-input>
                <csc-input-password-retype
                    v-model="data.password"
                    :disable="loading"
                    dense
                />
            </div>
            <div
                class="col-xs-12 col-lg-3"
            >
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
                        v-slot:prepend
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
                        v-slot:prepend
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
                :disable="$v.data.$invalid || loading"
                :label="$t('Create seat')"
                @click="save()"
            />
        </div>
    </div>
</template>

<script>
import {
    mapGetters
} from 'vuex'
import {
    required,
    maxLength,
    numeric,
    between
} from 'vuelidate/lib/validators'
import { inRange } from 'src/helpers/validation'
import CscInput from 'components/form/CscInput'
import CscInputPasswordRetype from 'components/form/CscInputPasswordRetype'
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
    validations: {
        data: {
            name: {
                required,
                maxLength: maxLength(64)
            },
            extension: {
                required,
                numeric,
                maxLength: maxLength(64),
                isInRange: function (value) {
                    return inRange(value, this.getMinAllowedExtension, this.getMaxAllowedExtension, between)
                }
            }
        }
    },
    data () {
        return {
            data: this.getDefaults()
        }
    },
    computed: {
        ...mapGetters('pbx', [
            'getExtensionHint',
            'getMinAllowedExtension',
            'getMaxAllowedExtension'
        ]),
        seatNameErrorMessage () {
            if (!this.$v.data.name.required) {
                return this.$t('{field} is required', {
                    field: this.$t('Seat name')
                })
            } else if (!this.$v.data.name.maxLength) {
                return this.$t('{field} must have at most {maxLength} letters', {
                    field: this.$t('Seat name'),
                    maxLength: this.$v.data.name.$params.maxLength.max
                })
            } else {
                return ''
            }
        },
        extensionErrorMessage () {
            if (!this.$v.data.extension.required) {
                return this.$t('{field} is required', {
                    field: this.$t('Extension')
                })
            } else if (!this.$v.data.extension.maxLength) {
                return this.$t('{field} must have at most {maxLength} letters', {
                    field: this.$t('Extension'),
                    maxLength: this.$v.data.extension.$params.maxLength.max
                })
            } else if (!this.$v.data.extension.numeric) {
                return this.$t('{field} must consist of numeric characters only', {
                    field: this.$t('Extension')
                })
            } else if (!this.$v.data.extension.isInRange) {
                return this.getExtensionHint
            } else {
                return ''
            }
        },
        webPasswordErrorMessage () {
            if (!this.$v.data.webPassword.required) {
                return this.$t('{field} is required', {
                    field: this.$t('Password')
                })
            } else if (!this.$v.data.webPassword.maxLength) {
                return this.$t('{field} must have at most {maxLength} letters', {
                    field: this.$t('Password'),
                    maxLength: this.$v.data.webPassword.$params.maxLength.max
                })
            } else {
                return ''
            }
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
                name: '',
                extension: '',
                password: {
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
        save () {
            this.$emit('save', {
                name: this.data.name,
                extension: this.data.extension,
                webPassword: this.data.password.password,
                aliasNumbers: this.data.aliasNumbers,
                groups: this.data.groups,
                soundSet: this.data.soundSet,
                clirIntrapbx: this.data.clirIntrapbx
            })
        },
        reset () {
            this.data = this.getDefaults()
            this.$v.$reset()
        }
    }
}
</script>

<style lang="stylus" rel="stylesheet/stylus">
.Password__strength-meter
    margin-top 20px !important
.Password__strength-meter:after,
.Password__strength-meter:before
    border-color #3b3440 !important
.Password
    max-width 100%
</style>
