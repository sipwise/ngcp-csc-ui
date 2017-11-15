<template>
    <q-layout ref="layout" view="lHh LpR lFf" :right-breakpoint="1100">
        <q-toolbar slot="header">
            <q-btn flat @click="$refs.layout.toggleLeft()">
                <q-icon name="menu"/>
            </q-btn>
            <q-toolbar-title>
                {{ $t('title') }}
                <span slot="subtitle"></span>
            </q-toolbar-title>
            <q-btn flat @click="" icon-right="fa-user-circle">
                <span id="user-login-as" class="gt-sm">{{ $t('loggedInAs') }}</span>
                <span id="user-name" class="gt-xs">{{ getUsername }}</span>
                <q-popover ref="popover">
                    <q-list item-separator link>
                        <q-item @click="logout()">
                            <q-item-main label="Logout" />
                            <q-item-side icon="exit to app"/>
                        </q-item>
                    </q-list>
                </q-popover>
            </q-btn>
        </q-toolbar>
        <q-list id="main-menu" slot="left" no-border link inset-delimiter>
            <q-side-link item to="/user/conversations">
                <q-item-side icon="question answer"></q-item-side>
                <q-item-main :label="$t('navigation.conversations.title')"
                             :sublabel="$t('navigation.conversations.subTitle')"/>
            </q-side-link>
            <q-collapsible :opened="isCallForward" intend icon="fa-angle-double-right"
                           :label="$t('navigation.callForward.title')"
                           :sublabel="$t('navigation.callForward.subTitle')">
                <q-side-link item to="/user/call-forward/always">
                    <q-item-side icon="check circle"/>
                    <q-item-main :label="$t('navigation.callForward.always')"/>
                </q-side-link>
                <q-side-link item to="/user/call-forward/company-hours">
                    <q-item-side icon="schedule"/>
                    <q-item-main :label="$t('navigation.callForward.companyHours')"/>
                </q-side-link>
                <q-side-link item to="/user/call-forward/after-hours">
                    <q-item-side icon="watch later"/>
                    <q-item-main :label="$t('navigation.callForward.afterHours')"/>
                </q-side-link>
            </q-collapsible>
            <q-collapsible :opened="isCallBlocking" intend icon="fa-ban"
                           :label="$t('navigation.callBlocking.title')"
                           :sublabel="$t('navigation.callBlocking.subTitle')">
                <q-side-link item to="/user/call-blocking/incoming">
                    <q-item-side icon="call received"/>
                    <q-item-main :label="$t('navigation.callBlocking.incoming')"/>
                </q-side-link>
                <q-side-link item to="/user/call-blocking/outgoing">
                    <q-item-side icon="call made"/>
                    <q-item-main :label="$t('navigation.callBlocking.outgoing')"/>
                </q-side-link>
                <q-side-link item to="/user/call-blocking/privacy">
                    <q-item-side icon="fa-user-secret"/>
                    <q-item-main :label="$t('navigation.callBlocking.privacy')"/>
                </q-side-link>
            </q-collapsible>
            <q-side-link item to="/user/reminder">
                <q-item-side icon="fa-bell"/>
                <q-item-main
                    label="Reminder"
                    sublabel="Set your personal alarm"/>
            </q-side-link>
            <q-collapsible v-if="isPbxAdmin" :opened="isPbxConfiguration" intend icon="fa-gear"
                           :label="$t('navigation.pbxConfiguration.title')"
                           :sublabel="$t('navigation.pbxConfiguration.subTitle')">
                <q-side-link item to="/user/pbx-configuration/groups">
                    <q-item-side icon="fa-group"/>
                    <q-item-main :label="$t('navigation.pbxConfiguration.groups')"/>
                </q-side-link>
                <q-side-link item to="/user/pbx-configuration/seats">
                    <q-item-side icon="fa-home"/>
                    <q-item-main :label="$t('navigation.pbxConfiguration.seats')"/>
                </q-side-link>
                <q-side-link item to="/user/pbx-configuration/devices">
                    <q-item-side icon="fa-fax"/>
                    <q-item-main :label="$t('navigation.pbxConfiguration.devices')"/>
                </q-side-link>
            </q-collapsible>
        </q-list>
        <router-view />
        <q-fixed-position corner="top-right" :offset="[20, 20]" class="page-button transition-generic float-button">
            <q-fab v-if=""
                   color="primary" icon="question answer"
                   active-icon="clear" direction="down" flat>
                <q-fab-action v-if="hasFaxCapability" color="primary" @click="" icon="fa-fax">
                    <q-tooltip anchor="center right" self="center left" :offset="[15, 0]">{{ $t('sendFax') }}</q-tooltip>
                </q-fab-action>
                <q-fab-action v-if="hasSmsCapability" color="primary" @click="" icon="fa-send">
                    <q-tooltip anchor="center right" self="center left" :offset="[15, 0]">{{ $t('sendSms') }}</q-tooltip>
                </q-fab-action>
                <q-fab-action v-if="isCallAvailable" color="primary" @click="call()" icon="fa-phone">
                    <q-tooltip anchor="center right" self="center left" :offset="[15, 0]">{{ $t('startCall') }}</q-tooltip>
                </q-fab-action>
            </q-fab>
        </q-fixed-position>
        <csc-call ref="cscCall" slot="right" @close="$refs.layout.hideRight()" region="DE" />
    </q-layout>
</template>

<script>
    import _ from 'lodash';
    import { startLoading, stopLoading, showGlobalError, showToast } from '../../helpers/ui'
    import { mapState, mapGetters } from 'vuex'
    import CscCall from '../CscCall'
    import {
        QLayout,
        QToolbar,
        QToolbarTitle,
        QBtn,
        QIcon,
        QList,
        QListHeader,
        QItem,
        QItemSide,
        QItemMain,
        QPopover,
        QFab,
        QFabAction,
        QFixedPosition,
        QTooltip,
        QSideLink,
        QTransition,
        QCollapsible,
    } from 'quasar-framework'
    export default {
        name: 'default',
        mounted: function() {
            this.$refs.layout.showLeft();
            this.$refs.layout.hideRight();
            if(!this.hasUser) {
                startLoading();
                this.$store.dispatch('user/initUser').then(()=>{
                    stopLoading();
                    this.showInitialToasts();
                }).catch(()=>{
                    this.logout();
                });
            } else {
                this.showInitialToasts();
            }
        },
        components: {
            QLayout,
            QToolbar,
            QToolbarTitle,
            QBtn,
            QIcon,
            QList,
            QListHeader,
            QItem,
            QItemSide,
            QItemMain,
            QPopover,
            QFab,
            QFabAction,
            QFixedPosition,
            QTooltip,
            QSideLink,
            QTransition,
            QCollapsible,
            CscCall
        },
        computed: {
            ...mapGetters('call', [
                'isCallAvailable',
                'hasCallInitFailure'
            ]),
            ...mapGetters('user', [
                'hasUser',
                'getUsername',
                'isPbxAdmin',
                'hasSmsCapability',
                'hasFaxCapability'
            ]),
            ...mapState({
                isCallForward: state => _.startsWith(state.route.path, '/user/call-forward'),
                isCallBlocking: state => _.startsWith(state.route.path, '/user/call-blocking'),
                isPbxConfiguration: state => _.startsWith(state.route.path, '/user/pbx-configuration')
            }),
            hasCommunicationCapabilities() {
                return this.isCallAvailable || this.hasSmsCapability || this.hasFaxCapability;
            }
        },
        methods: {
            showInitialToasts() {
                if(this.isCallAvailable) {
                    showToast(this.$i18n.t('toasts.callAvailable'));

                }
                if(this.hasCallInitFailure) {
                    showToast(this.$i18n.t('toasts.callNotAvailable'));
                }
            },
            call() {
                this.$refs.layout.showRight();
                this.$refs.cscCall.init();
            },
            logout() {
                startLoading();
                this.$store.dispatch('user/logout').then(()=>{
                    stopLoading();
                    this.$router.push({path: '/login'});
                })
            }
        }
    }
</script>

<style lang="stylus">
@import '../../../src/themes/app.variables.styl';
@import '../../../src/themes/quasar.variables.styl';
#main-menu
    padding-top60px
#main-menu .q-item-side
    min-width 30px
#main-menu .q-item
    padding 12px 24px
#main-menu .router-link-active,
#main-menu .q-itemhover
    background-color #475360
#main-menu .q-item .q-item-sublabel
    color #5b7086
#main-menu .q-item .q-item-main,
#main-menu .q-item .q-item-side
    color #ADB3B8
#main-menu .q-collapsible-sub-item
    padding 0
#main-menu .q-collapsible-sub-item .q-item
    padding-left 60px
#user-login-as
    display inline-block
    text-transform none
    color #c5eab4
#user-login-asafter
    content " "
    white-space pre
#user-name
    font-weight bold
.q-card
    margin15px
    margin-left 0px
    margin-right 0px
.q-card.page
    padding 15px
    margin 0
.float-button
    z-index 1010
</style>
