<template>
    <q-layout
        id="csc-layout-login"
        view="lHh lpR lFf"
        class="bg-page"
    >
        <q-header
            id="csc-header-login"
            class="bg-transparent"
        >
            <q-toolbar
                id="csc-header-toolbar-login"
            >
                <csc-selection-language />
            </q-toolbar>
        </q-header>
        <q-page-container>
            <q-page
                id="csc-page-login"
                class="flex flex-center row"
            >
                <q-card
                    id="csc-login-card"
                    class="bg-main-menu no-shadow no-border-radius col-xs-12 col-sm-6 col-md-4 q-pa-sm"
                >
                    <q-card-section class="text-h5 text-center">
                        {{ $t('Create New Password') }}
                    </q-card-section>
                    <q-card-section>
                        <q-banner
                            dense
                            inline-actions
                            class="text-white text-center bg-red-14"
                        >
                            {{ $t('Your password has expired') }}
                        </q-banner>
                    </q-card-section>
                    <q-card-section>
                        <div
                            v-if="validationGuidelines && validationGuidelines.length > 0"
                            inline-actions
                            class="q-mb-md q-pa-md"
                        >
                            <p>Suggested password format:</p>
                            <q-item
                                v-for="(message, index) in validationGuidelines"
                                :key="index"
                                dense
                            >
                                <q-item-section>
                                    <span>
                                        <q-icon
                                            name="lock"
                                            size="1em"
                                            class="q-pa-xs"
                                        /> {{ message }}
                                    </span>
                                </q-item-section>
                            </q-item>
                        </div>
                    </q-card-section>
                    <q-card-section>
                        <q-form key="login-form">
                            <csc-input
                                v-model.trim="username"
                                outlined
                                :label="$t('Username')"
                                data-cy="csc-login-username"
                                :error="v$.username && v$.username.$errors.length > 0"
                                :error-message="$errMsg(v$.username.$errors)"
                                @keyup.enter="changePasswordAction"
                            >
                                <template
                                    #prepend
                                >
                                    <q-icon
                                        name="person"
                                    />
                                </template>
                            </csc-input>

                            <csc-input-password
                                v-model.trim="currentPassword"
                                outlined
                                clearable
                                :label="$t('Current Password')"
                                data-cy="csc-login-password"
                                :error="v$.currentPassword && v$.currentPassword.$errors.length > 0"
                                :error-message="$errMsg(v$.currentPassword.$errors)"
                                @keyup.enter="changePasswordAction"
                            />

                            <csc-input-password
                                v-model.trim="newPassword"
                                outlined
                                clearable
                                :label="$t('New Password')"
                                data-cy="csc-login-password"
                                :error="v$.newPassword && v$.newPassword.$errors.length > 0"
                                :error-message="$errMsg(v$.newPassword.$errors)"
                                @keyup.enter="changePasswordAction"
                            />

                            <csc-input
                                ref="passwordRetypeInput"
                                v-model.trim="passwordRetype"
                                outlined
                                clearable
                                icon="lock"
                                color="secondary"
                                :label="$t('Password Retype')"
                                data-cy="password-retype-field"
                                type="password"
                                autocomplete="new-password"
                                :error="v$.passwordRetype && v$.passwordRetype.$errors.length > 0"
                                :error-message="$errMsg(v$.passwordRetype.$errors)"
                                @keyup.enter="changePasswordAction"
                            >
                                <template
                                    #prepend
                                >
                                    <q-icon
                                        name="lock"
                                    />
                                </template>
                            </csc-input>

                            <div class="row justify-center q-pa-md">
                                <q-btn
                                    data-cy="sign-in"
                                    unelevated
                                    color="primary"
                                    icon="arrow_forward"
                                    :label="$t('Change Password')"
                                    @click="changePasswordAction"
                                />
                            </div>
                        </q-form>
                    </q-card-section>
                </q-card>
            </q-page>
        </q-page-container>
    </q-layout>
</template>

<script>
import useValidate from '@vuelidate/core'
import { required } from '@vuelidate/validators'
import CscSelectionLanguage from 'components/CscSelectionLanguage'
import CscInput from 'components/form/CscInput'
import CscInputPassword from 'components/form/CscInputPassword'
import { RequestState } from 'src/store/common'
import { mapWaitingActions } from 'vue-wait'
import { mapActions, mapState } from 'vuex'

export default {
    name: 'ChangeExpiredPassword',
    components: {
        CscSelectionLanguage,
        CscInput,
        CscInputPassword
    },
    data () {
        return {
            v$: useValidate(),
            username: '',
            currentPassword: '',
            newPassword: '',
            passwordStrengthScore: null,
            passwordRetype: '',
            validationGuidelines: []
        }
    },
    validations () {
        return {
            username: {
                required
            },
            currentPassword: {
                required
            },
            newPassword: {
                required
            },
            passwordRetype: {
                sameAsPassword (val) {
                    return val === this.newPassword
                }
            }
        }
    },
    computed: {
        ...mapState('user', [
            'changePasswordState',
            'changePasswordError'
        ])
    },
    watch: {
        changePasswordState (state) {
            if (state === RequestState.succeeded) {
                this.$q.notify({
                    position: 'top',
                    color: 'positive',
                    icon: 'check',
                    message: this.$t('Password changed successfully')
                })
                this.redirectToLogin()
            } else if (state === RequestState.failed) {
                this.$q.notify({
                    position: 'top',
                    color: 'negative',
                    icon: 'error',
                    timeout: 10000,
                    message: this.changePasswordError || this.$t('There was an error, please retry later')
                })
            }
        }
    },
    async mounted () {
        const guidelines = await this.getValidationGuidelines()
        this.validationGuidelines = this.formatValidationGuidelines(guidelines)
    },
    methods: {
        ...mapWaitingActions('user', [
            'fetchPreLoginPasswordInfo'
        ]),
        ...mapActions('user', [
            'changeExpiredPassword'
        ]),
        strengthMeterScoreUpdate (score) {
            this.passwordStrengthScore = score
        },
        async changePasswordAction () {
            this.v$.$touch()
            if (this.v$.$errors.length === 0) {
                return this.changeExpiredPassword({
                    username: this.username,
                    old_password: this.currentPassword,
                    new_password: this.newPassword
                })
            }
        },
        formatValidationGuidelines (validationRulesObject) {
            const guidelines = []
            for (const rule in validationRulesObject) {
                switch (rule) {
                case 'min_length':
                    guidelines.push(`Minimum ${validationRulesObject[rule]} characters long.`)
                    break
                case 'max_length':
                    guidelines.push(`Maximum ${validationRulesObject[rule]} characters long.`)
                    break
                case 'musthave_digit':
                    guidelines.push(`Contains a minimum of ${validationRulesObject[rule]} digits.`)
                    break
                case 'musthave_lowercase':
                    guidelines.push(`Contains a minimum of ${validationRulesObject[rule]} lowercases.`)
                    break
                case 'musthave_specialchar':
                    guidelines.push(`Contains a minimum of ${validationRulesObject[rule]} special characters.`)
                    break
                case 'musthave_uppercase':
                    guidelines.push(`Contains a minimum of ${validationRulesObject[rule]} uppercases.`)
                    break
                default:
                }
            }

            return guidelines
        },
        async getValidationGuidelines () {
            const defaultGuidelines = {
                max_length: 40,
                min_length: 12,
                musthave_digit: 3,
                musthave_lowercase: 3,
                musthave_specialchar: 3,
                musthave_uppercase: 3
            }
            const customGuidelines = await this.fetchPreLoginPasswordInfo()

            return customGuidelines ?? defaultGuidelines
        },
        redirectToLogin () {
            this.$router.push({ path: '/login' })
        }
    }
}

</script>

<style>
</style>
