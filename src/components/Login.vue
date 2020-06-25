<template>
    <q-layout>
        <q-toolbar
            id="csc-header-toolbar"
            color="primary"
            inverted
            slot="header"
        >
            <q-btn
                class="csc-user-menu-button no-shadow"
                icon="language"
                color="tertiary"
                round
                small
            >
                <q-popover
                    ref="languagePopover"
                >
                    <csc-language-menu
                        :language-label="languageLabel"
                        :language-labels="languageLabels"
                        @change-language="changeLanguage"
                    />
                </q-popover>
            </q-btn>
        </q-toolbar>
        <div
            id="csc-login"
            :class="loginClasses"
        >
            <div
                class="col col-12 col-md-6 col-lg-4 col-xl-4">
                <q-card
                    class="no-shadow"
                    :flat="isFlat"
                >
                    <q-card-title
                        class="csc-title"
                    >
                        {{ $t('pages.login.title') }}
                    </q-card-title>
                    <q-card-main>
                        <form
                            id="csc-login-form"
                        >
                            <q-field
                                icon="person"
                                :helper="$t('pages.login.username_helper')"
                                :count="128">
                                <q-input
                                    dark
                                    type="text"
                                    max-length="128"
                                    :float-label="$t('pages.login.username')"
                                    autofocus
                                    clearable
                                    dark
                                    v-model="username"
                                    @keyup.enter="login()"
                                />
                            </q-field>
                            <q-field
                                icon="lock"
                                :helper="$t('pages.login.password_helper')"
                                :count="32">
                                <q-input
                                    dark
                                    type="password"
                                    max-length="32"
                                    :float-label="$t('pages.login.password')"
                                    clearable
                                    dark
                                    v-model="password"
                                    @keyup.enter="login()"
                                />
                            </q-field>
<!--                            <q-field-->
<!--                                dark-->
<!--                                icon="language"-->
<!--                                >-->
<!--                                <q-select-->
<!--                                    dark-->
<!--                                    value=""-->
<!--                                    :options="languageLabels"-->
<!--                                    :float-label="languageLabel"-->
<!--                                    @change="changeLanguage"-->
<!--                                />-->
<!--                            </q-field>-->
                        </form>
                    </q-card-main>
                    <q-card-actions
                        class="justify-end"
                    >
                        <q-spinner-dots
                            v-if="loginRequesting"
                            color="primary"
                            size="32px"
                        />
                        <q-btn
                            v-if="!loginRequesting"
                            flat
                            icon="arrow_forward"
                            color="primary"
                            @click="login()"
                        >
                            {{ $t('pages.login.button') }}
                        </q-btn>
                    </q-card-actions>
                </q-card>
            </div>
        </div>
    </q-layout>
</template>

<script>

    import {
        mapGetters
    } from 'vuex'
    import {
        showGlobalError
    } from '../helpers/ui'
    import {
        QSelect,
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
        Platform,
        QSpinnerDots,
        QToolbar,
        QPopover,
        QFabAction,
        QFab
    } from 'quasar-framework'
    import {
        getLanguageLabel
    } from "../i18n";
    import CscLanguageMenu from "./layouts/CscLanguageMenu";
    export default {
        name: 'login',
        components: {
            QSelect,
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
            QSpinnerDots,
            QToolbar,
            QPopover,
            CscLanguageMenu,
            QFabAction,
            QFab
        },
        data () {
            return {
                username: '',
                password: '',
            }
        },
        computed: {
            isFlat() {
                return Platform.is.mobile;
            },
            loginClasses() {
                let classes = ['row', 'items-center', 'justify-center', 'full-height'];
                if(Platform.is.mobile) {
                    classes.push('mobile');
                }
                return classes;
            },
            ...mapGetters('user', [
                'loginRequesting',
                'loginSucceeded',
                'loginError',
                'locale',
                'languageLabels'
            ]),
            languageLabel() {
                return this.$t('language', {
                    language: getLanguageLabel(this.locale)
                });
            }
        },
        methods: {
            login() {
                this.$store.dispatch('user/login', {
                    username: this.username,
                    password: this.password
                });
            },
            changeLanguage(language) {
                this.$refs.languagePopover.close();
                this.$store.dispatch('user/changeSessionLanguage', language);
            }
        },
        watch: {
            loginSucceeded(loggedIn) {
                if(loggedIn) {
                    this.$router.push({path : '/'});
                }
            },
            loginError(error) {
                if(error) {
                    showGlobalError(this.$i18n.t('pages.login.error'));
                }
            }
        }
    }
</script>

<style lang="stylus" rel="stylesheet/stylus">
    @import '../themes/quasar.variables.styl';
    #csc-login
        min-height calc(100vh - 0px)
        margin-top -30px
        .q-card
            margin 0
            background-color $main-menu-background
            .csc-title
                padding $flex-gutter-md
                padding-bottom $flex-gutter-sm
                .q-card-title
                    font-size 24px
            .q-card-main
                padding-left $flex-gutter-md
                padding-right $flex-gutter-md
            .q-card-actions
                padding $flex-gutter-xs
    #csc-login.mobile
        .q-card
            background-color transparent
</style>
