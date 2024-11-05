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
            showDialog: false
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
            'loginError'
        ])
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
                password: this.password
            })
        },
        showRetrievePasswordDialog () {
            this.showDialog = true
        }
    }
}
</script>

<style lang="sass" rel="stylesheet/sass">
#csc-login-card
    margin: 0
    margin-top: $header-height * -2
</style>
