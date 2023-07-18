<template>
    <div class="relative-position">
        <q-slide-transition>
            <div
                v-if="!inputEnabled"
            >
                <q-btn
                    icon="lock"
                    flat
                    color="primary"
                    :label="buttonLabel"
                    @click="enableInput"
                />
            </div>
        </q-slide-transition>
        <q-slide-transition>
            <div
                v-if="inputEnabled"
            >
                <csc-input-password-retype
                    v-model="passwordConfirmed"
                    :password-label="passLabel"
                    :password-confirm-label="passConfirmLabel"
                    @validation-failed="isValid=false"
                    @validation-succeeded="isValid=true"
                />
                <div
                    class="row justify-start"
                >
                    <q-btn
                        flat
                        color="default"
                        icon="clear"
                        @click="cancel"
                    >
                        {{ $t('Cancel') }}
                    </q-btn>
                    <q-btn
                        flat
                        color="primary"
                        icon="done"
                        :disable="!isValid"
                        @click="openConfirmDialog"
                    >
                        {{ saveLabel }}
                    </q-btn>
                </div>
            </div>
        </q-slide-transition>
        <q-inner-loading
            :showing="loading"
        >
            <csc-spinner />
        </q-inner-loading>
    </div>
</template>

<script>

import CscInputPasswordRetype from 'components/form/CscInputPasswordRetype'
import CscSpinner from 'components/CscSpinner'
export default {
    name: 'CscChangePasswordEmbedded',
    components: { CscSpinner, CscInputPasswordRetype },
    props: {
        loading: {
            type: Boolean,
            default: false
        },
        saveButtonLabel: {
            type: String,
            default () {
                return ''
            }
        },
        btnLabel: {
            type: String,
            default () {
                return ''
            }
        },
        passwordLabel: {
            type: String,
            default () {
                return ''
            }
        },
        passwordConfirmLabel: {
            type: String,
            default () {
                return ''
            }
        },
        saveConformationText: {
            type: String,
            default: ''
        },
        password: {
            type: String,
            default: ''
        }
    },
    emits: ['change'],
    data () {
        return {
            inputEnabled: false,
            passwordConfirmed: {
                password: this.password,
                passwordRetype: ''
            },
            isValid: false
        }
    },
    computed: {
        saveLabel () {
            return this.saveButtonLabel === '' ? this.$t('Save') : this.saveButtonLabel
        },
        buttonLabel () {
            return this.btnLabel === '' ? this.$t('Change password') : this.btnLabel
        },
        passLabel () {
            return this.passwordLabel === '' ? this.$t('Password') : this.passwordLabel
        },
        passConfirmLabel () {
            return this.passwordConfirmLabel === '' ? this.$t('Password confirm') : this.passwordConfirmLabel
        }
    },
    methods: {
        enableInput () {
            this.inputEnabled = true
            this.reset()
        },
        cancel () {
            this.inputEnabled = false
            this.reset()
        },
        reset () {
            this.passwordConfirmed.password = this.password
            this.passwordConfirmed.passwordRetype = ''
        },
        submit () {
            this.$emit('change', this.passwordConfirmed.password)
        },
        openConfirmDialog () {
            if (this.saveConformationText) {
                this.$q.dialog({
                    title: this.buttonLabel,
                    message: this.saveConformationText,
                    color: 'primary',
                    cancel: true,
                    persistent: true
                }).onOk(data => {
                    this.submit()
                })
            } else {
                this.submit()
            }
        }
    }
}
</script>
