<template>
    <q-layout
        :class="layoutClasses"
        ref="layout"
        view="lHh LpR lFf"
        v-model="sideStates"
        @left-breakpoint="leftBreakpoint"
    >
            <div
                id="csc-header"
                :class="headerClasses"
            >
                <csc-logo
                    id="csc-main-logo"
                    color="light"
                />
                <div
                    class="csc-header-content"
                >
                    <q-btn
                        v-if="isMobile"
                        flat
                        @click="$refs.layout.toggleLeft()"
                    >
                        <q-icon name="menu" />
                    </q-btn>
                    <div
                        id="csc-user-menu"
                    >
                        <q-btn
                            icon="person"
                            color="faded"
                            round
                            small
                        />
                        <span
                            class="csc-username"
                        >
                            {{ getUsername }}
                        </span>
                        <q-popover ref="popover">
                            <q-list
                                no-border
                                link
                                class="csc-toolbar-btn-popover"
                            >
                                <q-item
                                    @click="navigateToUserSettings"
                                >
                                    <q-item-side
                                        icon="person pin"
                                        color="primary"
                                    />
                                    <q-item-main :label="$t('settings')" />
                                </q-item>
                                <q-item @click="logout()">
                                    <q-item-side
                                        icon="exit to app"
                                        color="primary"
                                    />
                                    <q-item-main :label="$t('logout')" />
                                </q-item>
                            </q-list>
                        </q-popover>
                    </div>

                </div>
            </div>
        <div
            v-if="!isMobile"
            slot=left
            class="csc-toggle-menu"
        >
            <q-icon
                name="keyboard_arrow_left"
                @click="toggleMenu()"
            />
        </div>
        <div
            v-if="isMobile"
            slot=left
            class="csc-toggle-menu"
        >
            <q-icon
                name="clear"
                @click="$refs.layout.hideLeft()"
                color="default"
            />
        </div>
        <csc-main-menu
            slot="left"
            :call-state-title="callStateTitle"
            :call-state-subtitle="callStateSubtitle"
            :is-call-forward="isCallForward"
            :is-call-blocking="isCallBlocking"
            :is-pbx-admin="isPbxAdmin"
            :is-pbx-configuration="isPbxConfiguration"
        />
        <router-view
            :has-fax="hasFaxCapability && hasSendFaxFeature"
            @send-fax="showSendFax()"
        />
        <csc-send-fax
            ref="sendFax"
        />
        <csc-call
            ref="call"
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
            :menu-minimized="menuMinimized"
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
    import CscLogo from '../CscLogo'
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
    import CscMainMenu from "./MainMenu";
    export default {
        name: 'default',
        data() {
            return {
                sideStates: {
                    left: true,
                    right: false
                },
                mobileMenu: null,
                menuMinimized: false
            }
        },
        mounted() {
            this.$store.dispatch('user/initUser');
            window.addEventListener('orientationchange', ()=>{
                this.$root.$emit('orientation-changed');
            });
            window.addEventListener('resize', ()=>{
                this.$root.$emit('window-resized');
            });
        },
        mixins: [
            platformMixin
        ],
        components: {
            CscMainMenu,
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
            CscSendFax,
            CscLogo
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
                if(this.menuMinimized) {
                    classes.push('csc-menu-minimized');
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
            },
            headerClasses() {
                let classes = ['transition-generic'];
                if(this.isMobile) {
                    classes.push('csc-header-mobile');
                }
                if(this.isMobile || this.isMenuClosed) {
                    classes.push('csc-header-full');
                }
                return classes;
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
            },
            toggleMenu() {
                this.menuMinimized = !this.menuMinimized;
            },
            sideStateLeft() {
                return this.sideStates.left;
            },
            navigateToUserSettings() {
                this.$router.push('/user/user-settings');
                this.$refs.popover.close();
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
                if(this.$refs.call) {
                    this.$nextTick(()=>{
                        this.$refs.call.fitMedia();
                    });
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
        padding 0
        .q-item
            padding-top $flex-gutter-xs * 1.4
            padding-bottom  $flex-gutter-xs * 1.4
            .q-item-side-left
                min-width auto
            .q-item-main
                margin-left $flex-gutter-sm
            .q-icon
                color $main-menu-icon-color
            .q-item-label
                color $main-menu-title-color
                font-weight bold
                white-space nowrap
            .q-item-sublabel
                color $main-menu-subtitle-color
        .q-item:hover
            background-color $main-menu-item-hover-background
        .q-item.router-link-active
            .q-icon
                color $main-menu-icon-active-color
            .q-item-label
                color $main-menu-title-active-color
                font-weight bold
            .q-item-sublabel
                color $main-menu-subtitle-active-color
            background-color transparent
    #user-login-as
        display inline-block
        text-transform none
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
    #csc-header
        position fixed
        top 0
        left $layout-aside-left-width
        right 0
        height $header-height
        overflow hidden
        z-index 100
        background-color $secondary
        #csc-main-logo
            position absolute
            height $header-height - ($logo-margin * 2)
            right $logo-margin
            top $logo-margin
        .csc-header-content
            position absolute
            top 0
            right 0
            left 0
            bottom 0
            padding $logo-margin
            background linear-gradient(to bottom, rgba(21,29,48,0.5) 0%,rgba(21,29,48,0) 75%,rgba(21,29,48,0) 100%)
    #csc-header.csc-header-mobile
        #csc-main-logo
            position absolute
            height $header-height-mobile - ($logo-margin-mobile * 2)
            right $logo-margin-mobile
            top $logo-margin-mobile
    #csc-header.csc-header-full
        left 0
    #csc-user-menu
        cursor pointer
        display inline-block
        .csc-username
            padding-left 4px
    .csc-toggle-menu
        cursor pointer
        position absolute
        top $logo-margin
        right $logo-margin
        display flex
        justify-content center
        align-items center
        width 40px
        height 40px
        .q-icon
            display flex
            position relative
            font-size 24px
    .layout-aside-left
        padding-top $header-height
    .csc-menu-minimized
        .layout-aside-left
            width $main-menu-minimized-width
            .q-item-main
                display none
        .csc-toggle-menu
            width $main-menu-minimized-width
            left 0
        #main-menu
            .q-collapsible
                .q-collapsible-sub-item
                    padding 0
        #csc-header
            left $main-menu-minimized-width
    .mobile
        .layout-aside-left
            width auto
            right 0
</style>
