<template>
    <q-layout
        :class="layoutClasses"
        ref="layout"
        view="lHh LpR lFf"
        v-model="sideStates"
        @left-breakpoint="leftBreakpoint"
    >
        <q-toolbar slot="header">
            <q-btn
                flat
                @click="$refs.layout.toggleLeft()"
            >
                <q-icon name="menu" />
            </q-btn>
            <q-toolbar-title>
                {{ pageTitleExt }}
                <span slot="subtitle">
                    {{ pageSubtitleExt }}
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
                <q-item-side icon="call" />
                <q-item-main
                    :label="callStateTitle"
                    :sublabel="callStateSubtitle"
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
                intend icon="block"
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
        <csc-send-fax
            ref="sendFax"
        />
        <csc-call
            :call-state="callState"
            :call-number="callNumber"
            :ended-reason="endedReason"
            :full-view="isFullView"
            :minimized="!isHome && !isMaximized"
            :maximizable="!isHome"
            :closed="!isCalling && !isHome"
            :local-media-stream="localMediaStream"
            :remote-media-stream="remoteMediaStream"
            :is-video-call="hasVideo"
            :has-local-video="hasLocalVideo"
            :has-remote-video="hasRemoteVideo"
            :microphone-enabled="isMicrophoneEnabled"
            :camera-enabled="isCameraEnabled"
            :remote-volume-enabled="isRemoteVolumeEnabled"
            :dialpad-opened="isDialpadOpened"
            @start-call="startCall"s
            @accept-call="acceptCall"
            @end-call="endCall"
            @close-call="closeCall"
            @toggle-microphone="toggleMicrophone"
            @toggle-camera="toggleCamera"
            @toggle-remote-volume="toggleRemoteVolume"
            @click-dialpad="clickDialpad"
            @toggle-dialpad="toggleDialpad"
            @maximize-call="maximizeCall"
            @minimize-call="minimizeCall"
        />
    </q-layout>
</template>

<script>
    import {
        normalizeDestination
    } from '../../filters/number-format'
    import platformMixin from '../../mixins/platform'
    import {
        startLoading,
        stopLoading,
        showToast,
        showGlobalError,
        enableIncomingCallNotifications
    } from '../../helpers/ui'
    import {
        mapGetters
    } from 'vuex'
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
        QCollapsible
    } from 'quasar-framework'
    export default {
        name: 'default',
        data() {
            return {
                sideStates: {
                    left: true,
                    right: false
                },
                mobileMenu: null
            }
        },
        mounted() {
            this.$store.dispatch('user/initUser');
        },
        mixins: [
            platformMixin
        ],
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
            CscSendFax
        },
        computed: {
            ...mapGetters([
                'pageTitle',
                'pageSubtitle',
                'isCallForward',
                'isCallBlocking',
                'isPbxConfiguration',
                'isHome',
                'title'
            ]),
            ...mapGetters('call', [
                'callState',
                'callNumber',
                'callNumberInput',
                'endedReason',
                'isCalling',
                'localMediaStream',
                'remoteMediaStream',
                'isCallAvailable',
                'hasCallInitError',
                'hasVideo',
                'hasLocalVideo',
                'hasRemoteVideo',
                'isMicrophoneEnabled',
                'isCameraEnabled',
                'isRemoteVolumeEnabled',
                'isMaximized',
                'isDialpadOpened',
                'callStateTitle',
                'callStateSubtitle'
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
            hasCommunicationCapabilities() {
                return (this.hasSmsCapability && this.hasSendSmsFeature) ||
                    (this.hasFaxCapability && this.hasSendFaxFeature);
            },
            isMenuClosed() {
                return !this.sideStates.left;
            },
            isFullView() {
                return this.isMenuClosed || this.isMobile || this.mobileMenu;
            },
            layoutClasses() {
                let classes = [];
                if(this.isCalling) {
                    classes.push('csc-layout-call-active');
                }
                return classes;
            },
            callNumberFormatted() {
                return normalizeDestination(this.callNumber);
            },
            pageTitleExt() {
                if(this.isHome) {
                    return this.callStateTitle;
                }
                else {
                    return this.pageTitle;
                }
            },
            pageSubtitleExt() {
                if(this.isHome) {
                    return this.callStateSubtitle;
                }
                else {
                    return this.pageSubtitle;
                }
            }
        },
        methods: {
            showSendFax() {
                this.$refs.sendFax.showModal();
            },
            hideSendFax() {
                this.$refs.sendFax.hideModal();
            },
            startCall(localMedia) {
                if(this.callNumberInput !== '' && this.callNumberInput !== null) {
                    this.$store.dispatch('call/start', localMedia);
                }
            },
            acceptCall(localMedia) {
                this.$store.dispatch('call/accept', localMedia);
            },
            closeCall() {
                this.$store.commit('call/inputNumber');
            },
            endCall() {
                this.$store.dispatch('call/end');
            },
            toggleMicrophone() {
                this.$store.dispatch('call/toggleMicrophone');
            },
            toggleCamera() {
                this.$store.dispatch('call/toggleCamera');
            },
            toggleRemoteVolume() {
                this.$store.dispatch('call/toggleRemoteVolume');
            },
            clickDialpad(value) {
                this.$store.dispatch('call/sendDTMF', value);
            },
            toggleDialpad() {
                this.$store.commit('call/toggleDialpad');
            },
            maximizeCall() {
                if(this.isMobile) {
                    this.$router.push({path: '/user/home'});
                }
                else {
                    this.$store.commit('call/maximize');
                }
            },
            minimizeCall() {
                this.$store.commit('call/minimize');
            },
            logout() {
                startLoading();
                this.$store.dispatch('user/logout').then(()=>{
                    stopLoading();
                    this.$router.push({path: '/login'});
                })
            },
            leftBreakpoint(enabled) {
                this.mobileMenu = !enabled;
            },
            setCallStateTitle() {
                let title = this.callStateTitle;
                if(this.callStateSubtitle !== '') {
                    title = title + " (" + this.callStateSubtitle + ")";
                }
                document.title = this.title + " - " + title;
            }
        },
        watch: {
            callState(state) {
                if(state === 'incoming' && this.isMobile) {
                    this.$refs.layout.hideLeft();
                }
                if(this.isHome) {
                    this.setCallStateTitle();
                }
            },
            isHome(isHome) {
                if(isHome) {
                    this.$store.commit('call/minimize');
                    this.setCallStateTitle();
                }
            },
            userDataSucceeded(userDataSucceeded) {
                if(userDataSucceeded) {
                    enableIncomingCallNotifications();
                }
            },
            isCallAvailable(value) {
                if(value) {
                    showToast(this.$i18n.t('toasts.callAvailable'));
                }
            },
            hasCallInitError(value) {
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
            },
            $route () {
                if(!this.isHome) {
                    this.$store.commit('call/minimize');
                }
            }
        }
    }
</script>

<style lang="stylus" rel="stylesheet/stylus">
    @import '../../themes/app.common'
    .page.page-call-active
        padding-bottom 120px
    #main-menu
        padding-top 60px
        .q-item-side
            min-width 30px
        .q-item
            padding 12px 24px
            .q-item-sublabel
                color #5b7086
            .q-item-main,
            .q-item-side
                color #ADB3B8
        .router-link-active,
        .q-item:hover
            background-color #475360
        .q-collapsible-sub-item
            padding 0
            .q-item
                padding-left 60px
    #user-login-as
        display inline-block
        text-transform none
        color #c5eab4
    #user-login-as:after
        content " "
        white-space pre
    #user-name
        font-weight bold
    .q-card
        margin 15px
        margin-left 0
        margin-right 0
    .q-card.page
        padding 0
        margin 0
    .q-if-control.q-if-control-before.q-icon,
    .q-if-control.q-if-control-before.q-icon:before
        font-size 24px
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

    .csc-layout-call-active
        padding-bottom 152px
</style>
