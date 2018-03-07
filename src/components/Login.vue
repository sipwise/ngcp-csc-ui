<template>
    <q-layout>
        <div id="csc-login" :class="loginClasses">
            <div class="column col-lg-4 col-xl-4 col-md-3 gt-sm"></div>
            <div class="column col-12 col-md-6 col-lg-4 col-xl-4">
                <q-card :flat="isFlat">
                    <q-card-title>
                        <q-icon name="" />{{ $t('pages.login.title') }}
                        <span slot="subtitle"></span>
                    </q-card-title>
                    <q-card-main>
                        <form id="csc-login-form">
                            <q-field icon="fa-user-circle" :helper="$t('pages.login.username_helper')" :count="128">
                                <q-input type="text" max-length="128" :float-label="$t('pages.login.username')"
                                         autofocus clearable v-model="username" @keyup.enter="login()"/>
                            </q-field>
                            <q-field icon="fa-lock" :helper="$t('pages.login.password_helper')" :count="32">
                                <q-input type="password" max-length="32" :float-label="$t('pages.login.password')"
                                         clearable v-model="password" @keyup.enter="login()" />
                            </q-field>
                        </form>
                    </q-card-main>
                    <q-card-actions class="pull-right">
                        <q-btn flat icon-right="fa-arrow-right"
                               color="primary" @click="login()">{{ $t('pages.login.button') }}</q-btn>
                    </q-card-actions>
                </q-card>
            </div>
            <div class="column col-lg-4 col-xl-4 col-md-3 gt-sm"></div>
        </div>
    </q-layout>
</template>

<script>

    import { mapGetters } from 'vuex'
    import { startLoading, stopLoading, showGlobalError } from '../helpers/ui'
    import { QLayout, QCard, QCardTitle, QCardSeparator, QCardMain, QField, QInput,
        QCardActions, QBtn, QIcon, Platform } from 'quasar-framework'

    export default {
        name: 'login',
        components: {
            QLayout,
            QCard,
            QCardTitle,
            QCardSeparator,
            QCardMain,
            QField,
            QInput,
            QCardActions,
            QBtn,
            QIcon
        },
        data () {
            return {
                username: '',
                password: ''
            }
        },
        computed: {
            isFlat() {
                return Platform.is.mobile;
            },
            loginClasses() {
                let classes = ['row'];
                if(Platform.is.mobile) {
                    classes.push('mobile');
                }
                return classes;
            },
            ...mapGetters('user', [
                'loginRequesting',
                'loginSucceeded',
                'loginError'
            ]),
        },
        methods: {
            login() {
                this.$store.dispatch('user/login', {
                    username: this.username,
                    password: this.password
                });
            }
        },
        watch: {
            loginRequesting(logging) {
                if(logging) {
                    startLoading();
                }
            },
            loginSucceeded(loggedIn) {
                if(loggedIn) {
                    this.$router.push({path : '/'});
                }
            },
            loginError(error) {
                if(error) {
                    stopLoading();
                    showGlobalError(this.$i18n.t('pages.login.error'));
                }
            }
        }
    }
</script>

<style lang="stylus" rel="stylesheet/stylus">
    @import '../themes/app.variables.styl';

    #csc-login {
        padding-top: 12%;
    }

    #csc-login.mobile {
        padding-top: 0;
    }

    #csc-login .q-card-title {
        font-size: 22px;
        color: $primary;
    }

    #csc-login .q-card-primary {
        padding:30px;
        padding-bottom: 0;
    }

    #csc-login .q-field:first-child {
        margin-top:0;
    }

    #csc-login .q-card-main {
        padding:30px;
    }

    #csc-login .q-card-actions {
        padding:15px;
        padding-top: 0;
    }
</style>
