<template>
    <q-layout ref="layout" :view="layoutView" :right-breakpoint="1100"
              @right-breakpoint="rightBreakPoint" :right-class="callClasses">
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
            <q-side-link item to="/user/home">
                <q-item-side icon="home"></q-item-side>
                <q-item-main :label="$t('navigation.home.title')"
                             :sublabel="$t('navigation.home.subTitle')"/>
            </q-side-link>
            <q-side-link item to="/user/conversations">
                <q-item-side icon="question answer"></q-item-side>
                <q-item-main :label="$t('navigation.conversations.title')"
                             :sublabel="$t('navigation.conversations.subTitle')"/>
            </q-side-link>
            <q-collapsible :opened="isCallForward" intend icon="phone forwarded"
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
                    <q-item-side icon="group"/>
                    <q-item-main :label="$t('navigation.pbxConfiguration.groups')"/>
                </q-side-link>
                <q-side-link item to="/user/pbx-configuration/seats">
                    <q-item-side icon="person"/>
                    <q-item-main :label="$t('navigation.pbxConfiguration.seats')"/>
                </q-side-link>
                <q-side-link item to="/user/pbx-configuration/devices">
                    <q-item-side icon="fa-fax"/>
                    <q-item-main :label="$t('navigation.pbxConfiguration.devices')"/>
                </q-side-link>
            </q-collapsible>
        </q-list>
        <router-view />
        <q-fixed-position id="global-action-btn" corner="top-right" :offset="fabOffset" class="page-button transition-generic">
            <q-fab v-if="hasCommunicationCapabilities" color="primary" icon="question answer" active-icon="clear" direction="down" flat>
                <q-fab-action v-if="hasFaxCapability && hasSendFaxFeature" color="primary" @click="" icon="fa-fax">
                    <q-tooltip v-if="isDesktop" anchor="center right" self="center left" :offset="[15, 0]">{{ $t('sendFax') }}</q-tooltip>
                </q-fab-action>
                <q-fab-action v-if="hasSmsCapability && hasSendSmsFeature" color="primary" @click="" icon="fa-send">
                    <q-tooltip v-if="isDesktop" anchor="center right" self="center left" :offset="[15, 0]">{{ $t('sendSms') }}</q-tooltip>
                </q-fab-action>
                <q-fab-action v-if="isCallAvailable" color="primary" @click="call()" icon="fa-phone">
                    <q-tooltip v-if="isDesktop" anchor="center right" self="center left" :offset="[15, 0]">{{ $t('startCall') }}</q-tooltip>
                </q-fab-action>
            </q-fab>
        </q-fixed-position>
        <csc-call ref="cscCall" slot="right" @close="closeCall()" @fullscreen="toggleFullscreen()"
                  :fullscreen="isFullscreenEnabled" region="DE" />
        <q-window-resize-observable @resize="onWindowResize" />
    </q-layout>
</template>

<script>
    import _ from 'lodash';
    import { startLoading, stopLoading, showToast, enableIncomingCallNotifications} from '../../helpers/ui'
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
        Platform,
        QWindowResizeObservable
    } from 'quasar-framework'
    export default {
        name: 'default',
        mounted: function() {
            console.log('mounted()');
            this.$store.dispatch('communication/createFax', {
                destination: '43993006',
                data: 'test from csc',
                quality: 'normal'
            });
            if(Platform.is.mobile) {
                this.$store.commit('layout/hideLeft');
                this.$store.commit('layout/enableFullscreen');
            }
            else {
                this.$store.commit('layout/showLeft');
            }
            this.applyLayout();
            this.$store.dispatch('user/initUser');
            this.$store.dispatch('communication/createFax', {
                destination: '43993006',
                data: 'test from csc',
                quality: 'normal'
            });
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
            CscCall,
            QWindowResizeObservable
        },
        computed: {
            ...mapGetters('layout', [
                'right',
                'left',
                'isFullscreenEnabled'
            ]),
            ...mapGetters('call', [
                'isCallAvailable',
                'isCalling',
                'hasCallInitFailure'
            ]),
            ...mapGetters('user', [
                'isLogged',
                'hasUser',
                'getUsername',
                'isPbxAdmin',
                'hasSmsCapability',
                'hasFaxCapability',
                'hasSendSmsFeature',
                'hasSendFaxFeature',
                'userDataRequesting',
                'userDataSucceeded'
            ]),
            ...mapState({
                isCallForward: state => _.startsWith(state.route.path, '/user/call-forward'),
                isCallBlocking: state => _.startsWith(state.route.path, '/user/call-blocking'),
                isPbxConfiguration: state => _.startsWith(state.route.path, '/user/pbx-configuration')
            }),
            hasCommunicationCapabilities() {
                return this.isCallAvailable ||
                    (this.hasSmsCapability && this.hasSendSmsFeature) ||
                    (this.hasFaxCapability && this.hasSendFaxFeature);
            },
            callClasses() {
                let classes = {};
                if(this.isFullscreenEnabled) {
                    classes['csc-call-fullscreen'] = true;
                }
                if(this.isCalling) {
                    classes['csc-call-calling'] = true;
                }
                return classes;
            },
            layoutView() {
                if(this.isFullscreenEnabled) {
                    return 'lHr LpR lFr';
                }
                else {
                    return 'lHh LpR lFf';
                }
            },
            fabOffset() {
                if(Platform.is.mobile) {
                    return [16, 17];
                }
                else {
                    return [48, 17];
                }
            },
            isDesktop() {
                return Platform.is.desktop;
            }
        },
        methods: {
            onWindowResize() {
            },
            toggleFullscreen() {
                this.$store.commit('layout/toggleFullscreen');
            },
            call() {
                this.$store.dispatch('call/showCall');
            },
            logout() {
                startLoading();
                this.$store.dispatch('user/logout').then(()=>{
                    stopLoading();
                    this.$router.push({path: '/login'});
                })
            },
            rightBreakPoint() {
                if(this.right) {
                    this.$store.commit('layout/showRight');
                    this.$store.commit('layout/hideLeft');
                }
                else {
                    this.$store.commit('layout/hideRight');
                }
            },
            closeCall() {
                this.$store.commit('layout/hideRight');
            },
            applyLayout() {
                if(this.right) {
                    this.$refs.layout.showRight();
                    this.$refs.cscCall.focusNumberInput();
                }
                else {
                    this.$refs.layout.hideRight();
                    this.$refs.cscCall.blurNumberInput();
                }
                if(this.left) {
                    this.$refs.layout.showLeft();
                }
                else {
                    this.$refs.layout.hideLeft();
                }
            }
        },
        watch: {
            right(value) {
                if(value) {
                    this.$refs.layout.showRight();
                    this.$refs.cscCall.focusNumberInput();
                }
                else {
                    this.$refs.layout.hideRight();
                    this.$refs.cscCall.blurNumberInput();
                }
            },
            left(value) {
                if(value) {
                    this.$refs.layout.showLeft();
                }
                else {
                    this.$refs.layout.hideLeft();
                }
            },
            userDataRequesting(value) {
                if(value) {
                    startLoading();
                }
            },
            userDataSucceeded(value) {
                if(value) {
                    stopLoading();
                    enableIncomingCallNotifications();
                }
            },
            isCallAvailable(value) {
                if(value) {
                    showToast(this.$i18n.t('toasts.callAvailable'));
                }
            },
            hasCallInitFailure(value) {
                if(value) {
                    showToast(this.$i18n.t('toasts.callNotAvailable'));
                }
            }
        }
    }
</script>

<style lang="stylus" rel="stylesheet/stylus">
    @import '../../themes/quasar.variables.styl';

    #main-menu {
        padding-top:60px;
    }

    #main-menu .q-item-side {
        min-width: 30px;
    }

    #main-menu .q-item {
        padding: 12px 24px;
    }

    #main-menu .router-link-active,
    #main-menu .q-item:hover {
        background-color: #475360;
    }

    #main-menu .q-item .q-item-sublabel {
        color: #5b7086;
    }

    #main-menu .q-item .q-item-main,
    #main-menu .q-item .q-item-side {
        color: #ADB3B8;
    }

    #main-menu .q-collapsible-sub-item {
        padding: 0;
    }

    #main-menu .q-collapsible-sub-item .q-item {
        padding-left: 60px;
    }

    #user-login-as {
        display: inline-block;
        text-transform: none;
        color: #c5eab4;
    }
    #user-login-as:after {
        content: " ";
        white-space: pre;
    }
    #user-name {
        font-weight: bold;
    }

    .q-card {
        margin: 15px;
        margin-left: 0px;
        margin-right: 0px;
    }

    .q-card.page {
        padding: 0px;
        margin: 0;
    }

    #global-action-btn {
        z-index: 1001;
    }

    .layout-aside.fixed.csc-call-fullscreen {
        left: 0;
        right: 0;
        top: 0;
        bottom: 0;
        width: auto;
        z-index: 5000;
    }

    .csc-call-fullscreen .csc-call,
    .csc-call-fullscreen .csc-call .q-card {

    }

    .csc-call-fullscreen .csc-call .q-card .q-card-primary {
        position: absolute;
        top: 0;
        right: 0;
        left: 0;
        height: 72px;
        line-height: 72px;
        z-index: 6001;
        background: -moz-linear-gradient(top, rgba(51,64,77,1) 0%, rgba(235,236,237,0) 90%, rgba(255,255,255,0) 100%);
        background: -webkit-linear-gradient(top, rgba(51,64,77,1) 0%,rgba(235,236,237,0) 90%,rgba(255,255,255,0) 100%);
        background: linear-gradient(to bottom, rgba(51,64,77,1) 0%,rgba(235,236,237,0) 90%,rgba(255,255,255,0) 100%);
    }

    .csc-call-fullscreen .csc-call .q-card-actions {
        position: absolute;
        bottom: 0;
        right: 0;
        left: 0;
        z-index: 6001;
    }

    .csc-call-fullscreen .csc-call .q-card-main {
        position: absolute;
        top: 0;
        right: 0;
        left: 0;
        bottom: 0;
        z-index: 6000;
        font-size: 0;
    }

    .csc-call-fullscreen .csc-call-media {
        position: absolute;
        top: 0;
        bottom: 0;
        right: 0;
        left: 0;
        z-index: 1;
    }

    .csc-media-remote {
        z-index: 9;
    }

    .csc-call-fullscreen .csc-media-preview {
        position: absolute;
        bottom: 0;
        left: 0;
        width: 20%;
    }

    .csc-call-fullscreen .csc-media-preview video {
        position: relative;
        height: 100%;
    }

    .csc-call-fullscreen .csc-media-remote {
        position: absolute;
        top: 0;
        bottom: 0;
        right: 0;
        left: 0;
    }

    .csc-call-fullscreen .csc-media-remote video {
        position: absolute;
        height: 100%;
        bottom: 0;
    }

    .csc-call-fullscreen .csc-call-info {
        position: relative;
        top: 73px;
        z-index: 2;
    }

    .q-if-control.q-if-control-before.q-icon,
    .q-if-control.q-if-control-before.q-icon:before {
        font-size:24px;
    }

</style>
