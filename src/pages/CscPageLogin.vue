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
                    <q-card-section
                        class="text-h5"
                    >
                        {{ $t('Subscriber Sign In') }}
                    </q-card-section>
                    <q-card-section>
                        <form>
                            <csc-input
                                v-model.trim="username"
                                class="q-mb-sm"
                                type="text"
                                max-length="128"
                                :label="$t('Username')"
                                data-cy="csc-login-username"
                                :disable="loginRequesting"
                                autofocus
                                clearable
                                @keyup.enter="login()"
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
                                v-model.trim="password"
                                max-length="32"
                                :label="$t('Password')"
                                data-cy="csc-login-password"
                                :disable="loginRequesting"
                                clearable
                                @keypress.enter="login()"
                            />
                            <div
                                v-if="showOTP"
                                class="row q-mb-md"
                            >
                                <q-card
                                    flat
                                    bordered
                                    class="q-mt-lg"
                                >
                                    <q-card-section
                                        v-if="showOTPSecret"
                                        class="text-center q-mt-none"
                                    >
                                        <q-icon
                                            name="key"
                                            size="4rem"
                                            color="primary"
                                        />
                                        <h4 class="text-h4 h4 text-center q-mt-sm q-mb-sm">
                                            {{ $t('OTP Verification') }}
                                        </h4>
                                    </q-card-section>

                                    <q-card-section v-if="showOTPSecret">
                                        <q-list>
                                            <q-item>
                                                <div>
                                                    <h6 class="q-ma-sm">
                                                        <q-icon
                                                            name="download"
                                                            size="2rem"
                                                            color="primary"
                                                            class="q-mr-sm"
                                                        />
                                                        {{ $t('Download App') }}
                                                    </h6>
                                                    <p class="q-ml-md">
                                                        {{ $t('Install Google Authenticator app on your mobile device or use your preferred Authenticator app.') }}
                                                    </p>
                                                </div>
                                            </q-item>

                                            <div
                                                align="center"
                                                class="q-pa-md"
                                            >
                                                <a
                                                    class="q-ma-md"
                                                    target="_blank"
                                                    href="https://play.google.com/store/apps/details?id=com.google.android.apps.authenticator2&pcampaignid=pcampaignidMKT-Other-global-all-co-prtnr-py-PartBadge-Mar2515-1"
                                                ><img
                                                    alt="Get it on Google Play"
                                                    src="google-play-badge.png"
                                                    class="app-badge google-play-badge"
                                                ></a>

                                                <a
                                                    class="q-ma-md"
                                                    target="_blank"
                                                    href="https://apps.apple.com/us/app/google-authenticator/id388497605?itsct=apps_box_badge&itscg=30200"
                                                ><img
                                                    src="apple-store-badge.svg"
                                                    alt="Download on the App Store"
                                                    class="app-badge apple-store-badge"
                                                ></a>
                                            </div>

                                            <q-item>
                                                <div>
                                                    <h6 class="q-ma-sm">
                                                        <q-icon
                                                            name="qr_code"
                                                            size="2rem"
                                                            color="primary"
                                                            class="q-mr-sm"
                                                        />   {{ $t('Scan QR code') }}
                                                    </h6>
                                                    <p class="q-ml-md">
                                                        {{ $t('Open the Authenticator app to register your NGCP account.') }}
                                                    </p>
                                                </div>
                                            </q-item>
                                            <div
                                                v-if="OTPSecret && OTPSecret.type === 'qr'"
                                                class="text-center q-pa-md"
                                            >
                                                <q-img
                                                    :src="OTPSecret.data"
                                                    class="qr-code bg-white"
                                                />
                                                <q-btn
                                                    color="primary"
                                                    small
                                                    class="q-mt-md full-width"
                                                    @click="getOTPAsText"
                                                >
                                                    {{ $t('Display as setup key') }}
                                                </q-btn>
                                            </div>
                                            <div
                                                v-if="OTPSecret && OTPSecret.type === 'text'"
                                                class="text-center q-pa-md"
                                            >
                                                <q-card class="q-pa-sm">
                                                    <p class="text-bold text-green">
                                                        {{ OTPSecret.data }}
                                                    </p>
                                                </q-card>
                                                <q-btn
                                                    color="primary"
                                                    small
                                                    class="q-mt-md full-width"
                                                    @click="getOTPAsQrCode"
                                                >
                                                    {{ $t('Display as QR code') }}
                                                </q-btn>
                                            </div>
                                        </q-list>
                                    </q-card-section>

                                    <q-card-section>
                                        <q-list>
                                            <q-item>
                                                <div>
                                                    <h6 class="q-ma-sm">
                                                        <q-icon
                                                            name="password"
                                                            size="2rem"
                                                            color="primary"
                                                            class="q-mr-sm"
                                                        />{{ $t('Enter OTP') }}
                                                    </h6>
                                                    <p class="q-ml-md">
                                                        {{ $t('Use the Authenticator app to generate the verification code.') }}
                                                    </p>
                                                </div>
                                            </q-item>
                                            <q-item class="justify-center">
                                                <q-input
                                                    v-model="otp"
                                                    color="primary"
                                                    label-color="primary"
                                                    data-cy="otp-code"
                                                    :loading="loginRequesting"
                                                    :disable="loginRequesting"
                                                    :label="$t('OTP Code')"
                                                    :error="OTPError"
                                                    :error-message="loginError"
                                                    @input-clear="clearOTP"
                                                    @input="focusOTP"
                                                    @keypress.enter="login"
                                                />
                                            </q-item>
                                        </q-list>
                                    </q-card-section>
                                </q-card>
                            </div>
                        </form>
                    </q-card-section>
                    <q-card-actions
                        class="justify-between"
                    >
                        <q-btn
                            color="primary"
                            unelevated
                            flat
                            :label="$t('Forgot password?')"
                            data-cy="csc-login-resetpassword"
                            @click="showRetrievePasswordDialog"
                        />
                        <q-btn
                            icon="arrow_forward"
                            color="primary"
                            :label="$t('Sign In')"
                            data-cy="csc-login-button"
                            :loading="loginRequesting"
                            flat
                            @click="login()"
                        >
                            <template
                                #loading
                            >
                                <csc-spinner />
                            </template>
                        </q-btn>
                    </q-card-actions>
                    <csc-retrieve-password-dialog
                        v-model="showDialog"
                        @close="showDialog=false"
                    />
                </q-card>
            </q-page>
        </q-page-container>
    </q-layout>
</template>

<script>

import CscRetrievePasswordDialog from 'components/CscRetrievePasswordDialog'
import CscSelectionLanguage from 'components/CscSelectionLanguage'
import CscSpinner from 'components/CscSpinner'
import CscInput from 'components/form/CscInput'
import CscInputPassword from 'components/form/CscInputPassword'
import { Platform } from 'quasar'
import { showGlobalError, showToast } from 'src/helpers/ui'
import { deleteLocal, getLocal } from 'src/storage'
import { mapGetters } from 'vuex'

export default {
    name: 'CscPageLogin',
    components: {
        CscSelectionLanguage,
        CscInput,
        CscInputPassword,
        CscSpinner,
        CscRetrievePasswordDialog
    },
    data () {
        return {
            username: '',
            password: '',
            showDialog: false,
            otp: null,
            OTPError: false
        }
    },
    computed: {
        isFlat () {
            return Platform.is.mobile
        },
        loginClasses () {
            const classes = ['row', 'items-center', 'justify-center', 'full-height']
            if (Platform.is.mobile) {
                classes.push('mobile')
            }
            return classes
        },
        ...mapGetters('user', [
            'loginRequesting',
            'loginSucceeded',
            'loginError',
            'loginWaitingOTPCode',
            'OTPSecret'
        ]),
        showOTP () {
            return this.loginWaitingOTPCode || this.loginError === 'Invalid OTP Code'
        },
        showOTPSecret () {
            return this.OTPSecret !== null || (this.OTPSecret !== null && this.loginError === 'Invalid OTP Code')
        }
    },
    watch: {
        loginSucceeded (loggedIn) {
            if (loggedIn) {
                this.$router.push({ path: '/' })
            }
        },
        loginError (error) {
            if (error) {
                showGlobalError(error)
                const isInvalidOTPError = this.loginError === 'Invalid OTP Code'
                this.OTPError = isInvalidOTPError
                this.otp = null
            }
        }
    },
    mounted () {
        if (getLocal('show_session_expired_msg')) {
            showToast(this.$t('Session expired, please login again'))
            deleteLocal('show_session_expired_msg')
        }
    },
    methods: {
        login () {
            this.$store.dispatch('user/login', {
                username: this.username,
                password: this.password,
                ...(this.otp && { otp: this.otp }),
                type: 'qr'
            })
        },
        getOTPAsText () {
            this.$store.dispatch('user/getOTPSecretAsText', {
                username: this.username,
                password: this.password
            })
        },
        getOTPAsQrCode () {
            this.$store.dispatch('user/getOTPSecret', {
                username: this.username,
                password: this.password
            })
        },
        showRetrievePasswordDialog () {
            this.showDialog = true
        },
        focusOTP () {
            this.OTPError = false
        },
        clearOTP () {
            this.otp = null
            this.OTPError = false
        }
    }
}
</script>

<style lang="sass" rel="stylesheet/sass">
#csc-login-card
    margin: 0
    margin-top: $header-height * -2
.qr-code
    width: 200px
    height: 200px
.app-badge
    height: 50px
    object-fit: contain
</style>
