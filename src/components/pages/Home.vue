<template>
    <csc-page :title="$t('pages.home.title')">
        <div class="row md-gutter">
            <div class="col-lg-4 col-md-6 col-sm-6 col-xs-6">
                <div @click="call()">
                    <q-card :class="{ 'home-card-inactive': !isCallAvailable,
                        'home-card-active': isCallAvailable }"
                        class="no-margin"
                        flat>
                        <q-card-main align="center">
                            <q-icon name="call" class="home-icons" />
                        </q-card-main>
                        <q-card-actions align="center">
                            {{ $t('pages.home.cards.voiceCall') }}
                        </q-card-actions>
                    </q-card>
                </div>
            </div>
            <div class="col-lg-4 col-md-6 col-sm-6 col-xs-6">
                <div @click="call()">
                    <q-card :class="{ 'home-card-inactive': !isCallAvailable,
                        'home-card-active': isCallAvailable }"
                        class="no-margin"
                        flat>
                        <q-card-main align="center">
                            <q-icon name="video call" class="home-icons" />
                        </q-card-main>
                        <q-card-actions align="center">
                            {{ $t('pages.home.cards.videoCall') }}
                        </q-card-actions>
                    </q-card>
                </div>
            </div>
            <div class="col-lg-4 col-md-6 col-sm-6 col-xs-6">
                <div @click="screenShare()">
                    <q-card :class="{ 'home-card-inactive': !isCallAvailable || isMobile,
                        'home-card-active': isCallAvailable && !isMobile }"
                        class="no-margin"
                        flat>
                        <q-card-main align="center">
                            <q-icon name="screen share" class="home-icons" />
                        </q-card-main>
                        <q-card-actions align="center">
                            {{ $t('pages.home.cards.screenShare') }}
                        </q-card-actions>
                    </q-card>
                </div>
            </div>
            <div class="col-lg-4 col-md-6 col-sm-6 col-xs-6">
                <router-link to="/user/call-forward/always">
                    <q-card class="home-card-active no-margin" flat>
                        <q-card-main align="center">
                            <q-icon name="phone forwarded" class="home-icons" />
                        </q-card-main>
                        <q-card-actions align="center">
                            {{ $t('pages.home.cards.callForward') }}
                        </q-card-actions>
                    </q-card>
                </router-link>
            </div>
            <div class="col-lg-4 col-md-6 col-sm-6 col-xs-6">
                <router-link to="/user/call-blocking/incoming">
                    <q-card class="home-card-active no-margin" flat>
                        <q-card-main align="center">
                            <q-icon name="block" class="home-icons" />
                        </q-card-main>
                        <q-card-actions align="center">
                            {{ $t('pages.home.cards.callBlocking') }}
                        </q-card-actions>
                    </q-card>
                </router-link>
            </div>
            <div class="col-lg-4 col-md-6 col-sm-6 col-xs-6">
                <router-link to="/user/reminder">
                    <q-card class="home-card-active no-margin" flat>
                        <q-card-main align="center">
                            <q-icon name="fa-bell" class="home-icons" />
                        </q-card-main>
                        <q-card-actions align="center">
                            {{ $t('pages.home.cards.reminder') }}
                        </q-card-actions>
                    </q-card>
                </router-link>
            </div>
            <div class="col-lg-4 col-md-6 col-sm-6 col-xs-6">
                <q-card @click="buddyList()" class="home-card-inactive no-margin" flat>
                    <q-card-main align="center">
                        <q-icon name="contacts" class="home-icons" />
                    </q-card-main>
                    <q-card-actions align="center">
                        {{ $t('pages.home.cards.buddyList') }}
                    </q-card-actions>
                </q-card>
            </div>
        </div>
    </csc-page>
</template>

<script>
    import CscPage from '../CscPage'
    import CscCall from '../CscCall'
    import { mapGetters } from 'vuex'
    import { QCard, QCardMain, QCardActions, QIcon, Platform } from 'quasar-framework'
    import { showGlobalWarning } from '../../helpers/ui'

    export default {
        data() {
            return {
            }
        },
        components: {
            CscPage,
            CscCall,
            QCard,
            QCardMain,
            QCardActions,
            QIcon
        },
        computed: {
            ...mapGetters('call', [
                'isCallAvailable'
            ]),
            isMobile() {
                return Platform.is.mobile;
            }
        },
        methods: {
            call() {
                if(this.isCallAvailable) {
                    this.$store.dispatch('call/showCall');
                } else {
                    showGlobalWarning(this.$i18n.t('pages.home.featureNotAvailable'));
                }
            },
            screenShare() {
                if(this.isCallAvailable && !this.isMobile) {
                    this.$store.commit('layout/showRight');
                } else {
                    showGlobalWarning(this.$i18n.t('pages.home.featureNotAvailable'));
                }
            },
            buddyList() {
                showGlobalWarning(this.$i18n.t('pages.home.featureNotAvailable'));
            }
        }
    }
</script>

<style lang="stylus">
@import '~variables'
    .q-card-actions
        font-size 22px
        padding 0 10px 35px 10px
    .q-card-main
        font-size 22px
        padding-top 35px
    .home-card-active
        cursor pointer
        border solid 2px $primary
        .home-icons
            font-size 5.5rem
            color $primary
        .q-card-actions
            color $primary
    .home-card-inactive
        cursor not-allowed
        border solid 2px $grey
        .home-icons
            font-size 5.5rem
            color $grey
        .q-card-actions
            color $grey
    @media (max-width: $breakpoint-sm)
        .q-card-actions
            font-size 16px
            padding 0 10px 25px 10px
        .q-card-main
            font-size 22px
            padding-top 25px
        .home-card-active
            .home-icons
                font-size 3rem
        .home-card-inactive
            .home-icons
                font-size 3rem
</style>
