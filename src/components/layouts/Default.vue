<template>
    <q-layout
        :class="layoutClasses"
        ref="layout"
        view="lHh LpR lFf"
        v-model="sideStates"
        @left-breakpoint="leftBreakpoint"
    >
            <q-toolbar
                id="csc-header-toolbar"
                color="primary"
                inverted
                slot="header"
            >
                <q-btn
                    class="csc-user-menu-button"
                    v-if="isMobile"
                    flat
                    color="white"
                    @click="$refs.layout.toggleLeft()"
                >
                    <q-icon
                        name="menu"
                    />
                </q-btn>
                <q-btn
                    v-if="hasFaxCapability && hasSendFaxFeature"
                    class="csc-user-menu-button bg-primary text-dark"
                    flat
                    color="primary"
                    round
                    small
                >
                    <q-icon
                        name="apps"
                    />
                    <q-popover
                        ref="appPopover"
                    >
                        <q-list
                            class="no-padding"
                            no-border
                        >
                            <q-item
                                link
                                @click="showSendFax();$refs.appPopover.close()"
                            >
                                <q-item-side
                                    icon="fa-fax"
                                    color="primary"
                                />
                                <q-item-main
                                    :label="$t('communication.sendFax')"
                                />
                            </q-item>
                        </q-list>
                    </q-popover>
                </q-btn>
                <q-btn
                    class="csc-user-menu-button no-shadow"
                    v-if="!isMobile"
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
                <div
                    class="csc-user-menu-button"
                >
                    <q-btn
                        icon="person"
                        color="tertiary"
                        round
                        small
                        class="no-shadow"
                    >
                    </q-btn>
                    <span
                        v-if="!isMobile"
                        class="csc-username"
                    >
                        {{ getUsername }}
                    </span>
                    <q-popover
                        ref="userPopover"
                    >
                        <csc-user-menu
                            :username="getUsername"
                            @logout="logout"
                            @settings="userSettings"
                        />
                    </q-popover>
                </div>
                <csc-logo
                    id="csc-main-logo"
                    color="light"
                />
            </q-toolbar>
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
        <csc-language-menu
            slot="left"
            v-if="isMobile"
            :language-label="languageLabel"
            :language-labels="languageLabels"
            @change-language="changeLanguage"
        />
        <csc-main-menu
            slot="left"
            :call-state-title="callStateTitle"
            :call-state-subtitle="callStateSubtitle"
            :is-call-forward="isCallForward"
            :is-call-blocking="isCallBlocking"
            :is-pbx-admin="isPbxAdmin"
            :is-pbx-configuration="isPbxConfiguration"
        />
        <router-view />
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
    import platformMixin from '../../mixins/platform'
    import {
        startLoading,
        stopLoading,
        showToast,
        showGlobalError,
        enableIncomingCallNotifications
    } from '../../helpers/ui'
    import {
        mapGetters,
        mapActions
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
        QItemTile,
        QPopover,
        QSideLink,
        QCollapsible,
        QFabAction,
        QFab
    } from 'quasar-framework'
    import CscMainMenu from "./MainMenu"
    import CscLanguageMenu from "./CscLanguageMenu"
    import CscUserMenu from "./CscUserMenu"
    import {
        getLanguageLabel
    } from "../../i18n";

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
            CscLanguageMenu,
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
            QItemTile,
            QPopover,
            QSideLink,
            QCollapsible,
            CscCall,
            CscSendFax,
            CscLogo,
            CscUserMenu,
            QFabAction,
            QFab
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
                'isCallEnabled',
                'callState',
                'callNumber',
                'callNumberInput',
                'endedReason',
                'isCalling',
                'localMediaStream',
                'remoteMediaStream',
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
            ...mapGetters('conference', [
                'isConferencingEnabled'
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
                'userDataSucceeded',
                'changeSessionLocaleState',
                'locale',
                'languageLabels',
                'isRtcEngineUiVisible'
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
            },
            languageLabel() {
                return this.$t('language', {
                    language: getLanguageLabel(this.locale)
                });
            }
        },
        methods: {
            ...mapActions('user', [
                'forwardHome'
            ]),
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
            changeLanguage(language) {
                this.$store.dispatch('user/changeSessionLanguage', language);
                if(this.isMobile) {
                    this.$refs.layout.hideLeft();
                }
                else {
                    this.$refs.languagePopover.close();
                }
            },
            userSettings() {
                if(this.$refs.userPopover) {
                    this.$refs.userPopover.close();
                }
                this.$router.push({path: '/user/settings'});
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
            isCallEnabled(value) {
                if(value && this.isRtcEngineUiVisible) {
                    showToast(this.$i18n.t('toasts.callAvailable'));
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
            $route (route) {
                if(!this.isHome) {
                    this.$store.commit('call/minimize');
                }
                if(this.$refs.call) {
                    this.$nextTick(()=>{
                        this.$refs.call.fitMedia();
                    });
                }
                window.scrollTo(0, 0);
                if (route.path === '/user/home') {
                    this.forwardHome()
                }
            },
            changeSessionLocaleState(state) {
                if (state === 'succeeded') {
                    showToast(this.$t('toasts.changeSessionLanguageSuccessMessage'));
                }
            }
        }
    }
</script>

<style lang="stylus" rel="stylesheet/stylus">
    @import '../../themes/app.common'
    #csc-header-toolbar
        background-color $secondary
    #csc-main-logo
        height 52px
        width auto
        right 12px
        top 4px
        position absolute
    .csc-user-menu-button
        margin-left 0
        margin-right 0.2rem
        padding 0.2rem
        .on-left
            margin 0
        .csc-username
            padding-left 3px
            font-weight normal
            color rgba(255,255,255,0.6)
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
        .csc-header-content
            position absolute
            top 0
            right 0
            left 0
            bottom 0
            padding $logo-margin
            background linear-gradient(to bottom, rgba(21,29,48,0.5) 0%,rgba(21,29,48,0) 75%,rgba(21,29,48,0) 100%)
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
    .csc-subitem-label
        padding-left 20px
    .csc-toolbar-btn-popover
        .q-collapsible-sub-item
            padding 0 16px 0 16px
    .csc-collapsible-menu
        .q-icon
            display none
</style>
