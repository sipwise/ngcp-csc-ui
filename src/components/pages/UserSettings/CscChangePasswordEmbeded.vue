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
                    :label="btnLabel"
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
                    :password-label="passwordLabel"
                    :password-confirm-label="passwordConfirmLabel"
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
                        {{ $t('Save new password') }}
                    </q-btn>
                </div>
            </div>
        </q-slide-transition>
        <q-inner-loading :showing="loading">
            <q-spinner-dots
                size="32px"
                color="primary"
            />
        </q-inner-loading>
    </div>
</template>

<script>

import CscInputPasswordRetype from 'components/form/CscInputPasswordRetype'
export default {
    name: 'CscChangePasswordEmbedded',
    components: { CscInputPasswordRetype },
    props: {
        loading: {
            type: Boolean,
            default: false
        },
        btnLabel: {
            type: String,
            default () {
                return this.$t('Change Password')
            }
        },
        passwordLabel: {
            type: String,
            default () {
                return this.$t('Password')
            }
        },
        passwordConfirmLabel: {
            type: String,
            default () {
                return this.$t('Password confirm')
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
                    title: this.btnLabel,
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
