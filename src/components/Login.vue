<template>
    <q-layout>
        <div id="csc-login" class="row">
            <div class="column col-lg-4 col-xl-4 col-md-3 gt-sm"></div>
            <div class="column col-12 col-md-6 col-lg-4 col-xl-4">
                <q-card>
                    <q-card-title>
                        <q-icon name="" />{{ $t('login_title') }}
                        <span slot="subtitle"></span>
                    </q-card-title>
                    <q-card-main>
                        <q-field icon="fa-user-circle" :helper="$t('username_helper')" :count="128">
                            <q-input type="text" max-length="128" :float-label="$t('username')" clearable v-model="username"/>
                        </q-field>
                        <q-field icon="fa-lock" :helper="$t('password_helper')" :count="32">
                            <q-input type="password" max-length="32" :float-label="$t('password')" clearable v-model="password"/>
                        </q-field>
                    </q-card-main>
                    <q-card-actions class="pull-right">
                        <q-btn flat icon-right="fa-arrow-right" color="primary" @click="login()">{{ $t('login_button') }}</q-btn>
                    </q-card-actions>
                </q-card>
            </div>
            <div class="column col-lg-4 col-xl-4 col-md-3 gt-sm"></div>
        </div>
    </q-layout>
</template>

<script>
    import { startLoading, stopLoading, showGlobalError } from '../helpers/ui'
    import {
        QLayout,
        QCard,
        QCardTitle,
        QCardSeparator,
        QCardMain,
        QField,
        QInput,
        QCardActions,
        QBtn,
        QIcon,
        Loading,
        Alert } from 'quasar'
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
                user: '',
                pass: ''
            }
        },
        methods: {
            login() {
                startLoading();
                this.$store.dispatch('user/login').then(()=>{
                    stopLoading();
                    this.$router.push({path : '/'});
                }).catch((err)=>{
                    stopLoading();
                    showGlobalError(this.$i18n.t('login_error'));
                });
            }
        },
        computed: {
            username: {
                get () {
                    return this.$store.state.user.username;
                },
                set (value) {
                    this.$store.commit('user/updateUsername', value)
                }
            },
            password: {
                get () {
                    return this.$store.state.user.password;
                },
                set (value) {
                    this.$store.commit('user/updatePassword', value)
                }
            }
        }
    }
</script>

<style>
    #csc-login {
        padding-top: 15%;
    }

    #csc-login .q-card-container {
    }

</style>
