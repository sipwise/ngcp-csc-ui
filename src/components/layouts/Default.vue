<template>
    <q-layout ref="layout" view="lHr LpR lFr" :right-breakpoint="1100">
        <q-toolbar slot="header">
            <q-btn flat @click="$refs.layout.toggleLeft()">
                <q-icon name="menu"/>
            </q-btn>
            <q-toolbar-title>
                {{ $t('title') }}
                <span slot="subtitle"></span>
            </q-toolbar-title>
            <q-btn flat @click="" icon-right="fa-user-circle">
                <span id="user-login-as">{{ $t('loggedInAs') }}</span><span id="user-name">{{ getUsername }}</span>
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
                <q-item-main :label="$t('mainNavigation.conversations.title')"
                             :sublabel="$t('mainNavigation.conversations.subTitle')"/>
            </q-side-link>
            <q-collapsible :opened="isCallForward" intend icon="fa-angle-double-right"
                           :label="$t('mainNavigation.callForward.title')"
                           :sublabel="$t('mainNavigation.callForward.subTitle')">
                <q-side-link item to="/user/call-forward/always">
                    <q-item-side icon="check circle"/>
                    <q-item-main :label="$t('mainNavigation.callForward.always')"/>
                </q-side-link>
                <q-side-link item to="/user/call-forward/company-hours">
                    <q-item-side icon="schedule"/>
                    <q-item-main :label="$t('mainNavigation.callForward.companyHours')"/>
                </q-side-link>
                <q-side-link item to="/user/call-forward/after-hours">
                    <q-item-side icon="watch later"/>
                    <q-item-main :label="$t('mainNavigation.callForward.afterHours')"/>
                </q-side-link>
            </q-collapsible>
            <q-collapsible :opened="isCallBlocking" intend icon="fa-ban"
                           :label="$t('mainNavigation.callBlocking.title')"
                           :sublabel="$t('mainNavigation.callBlocking.subTitle')">
                <q-side-link item to="/user/call-blocking/incoming">
                    <q-item-side icon="fa-arrow-circle-o-left"/>
                    <q-item-main :label="$t('mainNavigation.callBlocking.incoming')"/>
                </q-side-link>
                <q-side-link item to="/user/call-blocking/outgoing">
                    <q-item-side icon="fa-arrow-circle-o-right"/>
                    <q-item-main :label="$t('mainNavigation.callBlocking.outgoing')"/>
                </q-side-link>
                <q-side-link item to="/user/call-blocking/privacy">
                    <q-item-side icon="fa-user-secret"/>
                    <q-item-main :label="$t('mainNavigation.callBlocking.privacy')"/>
                </q-side-link>
            </q-collapsible>
            <q-side-link item to="/user/reminder">
                <q-item-side icon="fa-bell"/>
                <q-item-main
                    label="Reminder"
                    sublabel="Set your personal alarm"/>
            </q-side-link>
            <q-collapsible v-if="isPbxAdmin" :opened="isPbxConfiguration" intend icon="fa-gear"
                           :label="$t('mainNavigation.pbxConfiguration.title')"
                           :sublabel="$t('mainNavigation.pbxConfiguration.subTitle')">
                <q-side-link item to="/user/pbx-configuration/groups">
                    <q-item-side icon="fa-group"/>
                    <q-item-main :label="$t('mainNavigation.pbxConfiguration.groups')"/>
                </q-side-link>
                <q-side-link item to="/user/pbx-configuration/seats">
                    <q-item-side icon="fa-home"/>
                    <q-item-main :label="$t('mainNavigation.pbxConfiguration.seats')"/>
                </q-side-link>
                <q-side-link item to="/user/pbx-configuration/devices">
                    <q-item-side icon="fa-fax"/>
                    <q-item-main :label="$t('mainNavigation.pbxConfiguration.devices')"/>
                </q-side-link>
            </q-collapsible>
        </q-list>
        <q-fixed-position corner="top-right" :offset="[20, 20]">
            <q-fab color="primary" icon="question answer" active-icon="clear" direction="left" flat>
                <q-fab-action color="primary" @click="" icon="fa-fax" flat>
                    <q-tooltip anchor="bottom middle" self="top middle" :offset="[0, 15]">{{ $t('sendFax') }}</q-tooltip>
                </q-fab-action>
                <q-fab-action color="primary" @click="" icon="fa-send" flat>
                    <q-tooltip anchor="bottom middle" self="top middle" :offset="[0, 15]">{{ $t('sendSms') }}</q-tooltip>
                </q-fab-action>
                <q-fab-action v-bind:color="(rtcEngineConnected)?'primary':'light'" @click="startCall" icon="fa-phone" flat>
                    <q-tooltip anchor="bottom middle" self="top middle" :offset="[0, 15]">{{ $t('startCall') }}</q-tooltip>
                </q-fab-action>
            </q-fab>
        </q-fixed-position>
        <router-view />
    </q-layout>
</template>

<script>
    import _ from 'lodash';
    import { startLoading, stopLoading, showGlobalError } from '../../helpers/ui'
    import { mapState, mapGetters } from 'vuex'
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
        QCollapsible
    } from 'quasar'
    export default {
        name: 'default',
        mounted: function() {
            this.$refs.layout.showLeft();
//            this.$store.dispatch('connectRtcEngine');
        },
        created: function() {
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
            QFab,
            QFabAction,
            QFixedPosition,
            QTooltip,
            QSideLink,
            QTransition,
            QCollapsible
        },
        computed: {
            ...mapGetters('user', ['getUsername', 'isPbxAdmin']),
            ...mapState({
                rtcEngineConnected: state => state.rtcEngineConnected,
                isCallForward: state => _.startsWith(state.route.path, '/user/call-forward'),
                isCallBlocking: state => _.startsWith(state.route.path, '/user/call-blocking'),
                isPbxConfiguration: state => _.startsWith(state.route.path, '/user/pbx-configuration')
            })
        },
        methods: {
            logout() {
                startLoading();
                this.$store.dispatch('user/logout').then(()=>{
                    stopLoading();
                    this.$router.push({path: '/login'});
                })
            },
            startCall() {
                if(!this.$store.state.rtcEngineConnected) {
                    showGlobalError(this.$t('rtcEngineDisconnected'));
                }
            },
            navigate(path) {
                this.$router.push({path: path});
            }
        }
    }
</script>

<style>
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
</style>
