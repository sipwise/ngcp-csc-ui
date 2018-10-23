<template>
    <q-layout
        ref="layout"
        :view="layoutView"
        :right-breakpoint="1100"
    >
        <q-toolbar slot="header">
            <q-btn
                flat
                @click="$refs.layout.toggleLeft()"
            >
                <q-icon name="menu" />
            </q-btn>
            <q-toolbar-title>
                {{ pageTitle }}
                <span slot="subtitle">
                    {{ pageSubtitle }}
                </span>
            </q-toolbar-title>
            <q-btn
                flat
                class="csc-toolbar-btn"
                v-if="hasCommunicationCapabilities"
            >
                <q-icon name="question answer" />
                <q-popover ref="communicationPopover">
                    <q-list
                        item-separator
                        link
                        class="csc-toolbar-btn-popover"
                    >
                        <q-item
                            @click="call();$refs.communicationPopover.close()"
                            v-if="isCallAvailable"
                        >
                            <q-item-side
                                icon="fa-phone"
                                color="primary"
                            />
                            <q-item-main :label="$t('startCall')" />
                        </q-item>
                        <q-item
                            @click="showSendFax();$refs.communicationPopover.close()"
                            v-if="hasFaxCapability && hasSendFaxFeature"
                        >
                            <q-item-side
                                icon="fa-fax"
                                color="primary"
                            />
                            <q-item-main :label="$t('sendFax')" />
                        </q-item>
                        <q-item
                            @click="$refs.communicationPopover.close()"
                            v-if="hasSmsCapability && hasSendSmsFeature"
                        >
                            <q-item-side
                                icon="fa-send"
                                color="primary"
                            />
                            <q-item-main :label="$t('sendSms')" />
                        </q-item>
                    </q-list>
                </q-popover>
            </q-btn>
            <q-btn
                flat
                class="csc-toolbar-btn csc-toolbar-btn-right"
            >
                <q-icon
                    name="fa-user-circle"
                    class="csc-toolbar-btn-icon"
                />
                <span
                    id="user-login-as"
                    class="gt-sm"
                >
                    {{ $t('loggedInAs') }}
                </span>
                <span
                    id="user-name"
                    class="gt-xs"
                >
                    {{ getUsername }}
                </span>
                <q-popover ref="popover">
                    <q-list
                        item-separator
                        link
                        class="csc-toolbar-btn-popover"
                    >
                        <q-item @click="logout()">
                            <q-item-side
                                icon="exit to app"
                                color="primary"
                            />
                            <q-item-main label="Logout" />
                        </q-item>
                    </q-list>
                </q-popover>
            </q-btn>
        </q-toolbar>
        <q-list
            id="main-menu"
            slot="left"
            no-border
            link
            inset-delimiter
        >
            <q-side-link
                item
                to="/user/home"
            >
                <q-item-side icon="home" />
                <q-item-main
                    :label="$t('navigation.home.title')"
                    :sublabel="$t('navigation.home.subTitle')"
                />
            </q-side-link>
            <q-side-link
                item
                to="/user/conversations"
            >
                <q-item-side icon="question answer" />
                <q-item-main
                    :label="$t('navigation.conversations.title')"
                    :sublabel="$t('navigation.conversations.subTitle')"
                />
            </q-side-link>
            <q-collapsible
                :opened="isCallForward"
                intend
                icon="phone forwarded"
                :label="$t('navigation.callForward.title')"
                :sublabel="$t('navigation.callForward.subTitle')"
            >
                <q-side-link
                    item
                    to="/user/call-forward/always"
                >
                    <q-item-side icon="check circle" />
                    <q-item-main :label="$t('navigation.callForward.always')" />
                </q-side-link>
                <q-side-link
                    item
                    to="/user/call-forward/company-hours"
                >
                    <q-item-side icon="schedule" />
                    <q-item-main :label="$t('navigation.callForward.companyHours')" />
                </q-side-link>
                <q-side-link
                    item
                    to="/user/call-forward/after-hours"
                >
                    <q-item-side icon="watch later" />
                    <q-item-main :label="$t('navigation.callForward.afterHours')" />
                </q-side-link>
            </q-collapsible>
            <q-collapsible
                :opened="isCallBlocking"
                intend icon="fa-ban"
                :label="$t('navigation.callBlocking.title')"
                :sublabel="$t('navigation.callBlocking.subTitle')"
            >
                <q-side-link
                    item
                    to="/user/call-blocking/incoming"
                >
                    <q-item-side icon="call received" />
                    <q-item-main :label="$t('navigation.callBlocking.incoming')" />
                </q-side-link>
                <q-side-link
                    item
                    to="/user/call-blocking/outgoing"
                >
                    <q-item-side icon="call made" />
                    <q-item-main :label="$t('navigation.callBlocking.outgoing')" />
                </q-side-link>
                <q-side-link
                    item
                    to="/user/call-blocking/privacy"
                >
                    <q-item-side icon="fa-user-secret" />
                    <q-item-main :label="$t('navigation.callBlocking.privacy')" />
                </q-side-link>
            </q-collapsible>
            <q-side-link
                item
                to="/user/reminder"
            >
                <q-item-side icon="fa-bell"/>
                <q-item-main
                    :label="$t('navigation.reminder.title')"
                    :sublabel="$t('navigation.reminder.subTitle')"
                />
            </q-side-link>
            <q-side-link item to="/user/speeddial">
                <q-item-side icon="touch app"/>
                <q-item-main
                    :label="$t('navigation.speeddial.title')"
                    :sublabel="$t('navigation.speeddial.subTitle')"
                />
            </q-side-link>
            <q-collapsible
                v-if="isPbxAdmin"
                :opened="isPbxConfiguration"
                intend
                icon="fa-gear"
                :label="$t('navigation.pbxConfiguration.title')"
                :sublabel="$t('navigation.pbxConfiguration.subTitle')"
            >
                <q-side-link
                    item
                    to="/user/pbx-configuration/groups"
                >
                    <q-item-side icon="group"/>
                    <q-item-main :label="$t('navigation.pbxConfiguration.groups')" />
                </q-side-link>
                <q-side-link
                    item
                    to="/user/pbx-configuration/seats"
                >
                    <q-item-side icon="person"/>
                    <q-item-main :label="$t('navigation.pbxConfiguration.seats')" />
                </q-side-link>
                <q-side-link
                    item
                    to="/user/pbx-configuration/devices"
                >
                    <q-item-side icon="fa-fax"/>
                    <q-item-main :label="$t('navigation.pbxConfiguration.devices')" />
                </q-side-link>
            </q-collapsible>
            <q-side-link
                item
                to="/user/voicebox"
            >
                <q-item-side icon="voicemail"/>
                <q-item-main
                    :label="$t('navigation.voicebox.title')"
                    :sublabel="$t('navigation.voicebox.subTitle')"
                />
            </q-side-link>
        </q-list>
        <router-view />
        <q-window-resize-observable @resize="onWindowResize" />
        <csc-send-fax ref="sendFax" />
        <csc-call
            :call-state="callState"
        />
    </q-layout>
</template>

<script>
    import _ from 'lodash';
    import {
        startLoading,
        stopLoading,
        showToast,
        showGlobalError,
        enableIncomingCallNotifications
    } from '../../helpers/ui'
    import { mapState, mapGetters } from 'vuex'
    import CscCall from '../call/CscCall'
    import CscSendFax from '../CscSendFax'
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
        QSideLink,
        QCollapsible,
        Platform,
        QWindowResizeObservable
    } from 'quasar-framework'
    export default {
        name: 'default',
        mounted: function() {
            if(Platform.is.mobile) {
                this.$store.commit('layout/hideLeft');
                this.$store.commit('layout/enableFullscreen');
            }
            else {
                this.$store.commit('layout/showLeft');
            }
            this.$store.dispatch('user/initUser');
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
            QSideLink,
            QCollapsible,
            CscCall,
            QWindowResizeObservable,
            CscSendFax
        },
        computed: {
            ...mapGetters('layout', [
                'right',
                'left',
                'isFullscreenEnabled'
            ]),
            ...mapGetters('call', [
                'callState',
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
            ...mapGetters('communication', [
                'createFaxState',
                'createFaxError'
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
                    return [16, 16];
                }
                else {
                    return [32, 32];
                }
            },
            isDesktop() {
                return Platform.is.desktop;
            },
            pageTitle() {
                return this.$store.getters['pageTitle'];
            },
            pageSubtitle() {
                return this.$store.getters['pageSubtitle'];
            }
        },
        methods: {
            showSendFax() {
                this.$refs.sendFax.showModal();
            },
            hideSendFax() {
                this.$refs.sendFax.hideModal();
            },
            onWindowResize() {
            },
            toggleFullscreen() {
                this.$store.commit('layout/toggleFullscreen');
            },
            call() {
                this.$refs.layout.showRight();
                this.$store.dispatch('call/showCall');
            },
            logout() {
                startLoading();
                this.$store.dispatch('user/logout').then(()=>{
                    stopLoading();
                    this.$router.push({path: '/login'});
                })
            },
            closeCall() {
                this.$refs.layout.hideRight();
                this.$store.commit('layout/hideRight');
            }
        },
        watch: {
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
            },
            createFaxState(state) {
                if (state === 'requesting') {
                    startLoading();
                }
                else if (state === 'failed') {
                    stopLoading();
                    showGlobalError(this.createFaxError);
                }
                else if (state === 'succeeded') {
                    stopLoading();
                    showToast(this.$t('communication.createFaxSuccessMessage'));
                    this.hideSendFax();
                }
            }
        }
    }
</script>

<style lang="stylus" rel="stylesheet/stylus">
    @import '../../themes/app.common';

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

    .q-if-control.q-if-control-before.q-icon,
    .q-if-control.q-if-control-before.q-icon:before {
        font-size:24px;
    }

    .csc-toolbar-btn-popover
        .q-item-main.q-item-section
            margin-left 0

    .q-toolbar

        .csc-toolbar-btn.q-btn
            padding-left 8px
            padding-right 8px

        .csc-toolbar-btn-right
            .csc-toolbar-btn-icon
                margin-right 8px
</style>
