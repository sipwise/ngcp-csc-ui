<template>
    <q-layout
        id="csc-layout-main"
        view="lHh LpR lFf"
        @resize="layoutResized"
    >
        <q-header
            id="csc-header-main"
            v-model="header"
            reveal
            class="bg-secondary"
        >
            <q-toolbar
                id="csc-header-toolbar-main"
            >
                <q-btn
                    v-if="isMobile"
                    flat
                    icon="menu"
                    color="primary"
                    @click="$refs.mainMenu.show()"
                />
                <q-btn
                    v-if="isFaxFeatureEnabled && isFaxServerSettingsActive"
                    class="q-mr-sm"
                    flat
                    dense
                    icon="apps"
                    data-cy="appsicon-more"
                    color="primary"
                >
                    <csc-popup-menu>
                        <csc-popup-menu-item
                            icon="description"
                            color="primary"
                            :label="$t('Send Fax')"
                            data-cy="send-fax"
                            @click="showSendFax()"
                        />
                    </csc-popup-menu>
                </q-btn>
                <csc-selection-language
                    v-if="!isMobile"
                />
                <q-btn
                    icon="person"
                    color="primary"
                    small
                    flat
                    dense
                    :label="getUsername"
                    data-cy="user-menu"
                >
                    <q-menu>
                        <csc-user-menu
                            :username="getUsername"
                        />
                    </q-menu>
                </q-btn>
                <q-btn
                    v-if="showQrBtn"
                    flat
                    dense
                    class="q-ml-sm"
                    icon="qr_code"
                    color="primary"
                    data-cy="qr-code-btn"
                    @click="showQrDialog"
                />
                <q-space />
                <csc-logo
                    v-if="isLogoRequested && !customLogo"
                    id="csc-default-logo"
                    class="q-mr-md q-pt-sm"
                />
                <csc-custom-logo
                    v-else-if="isLogoRequested && customLogo"
                    id="csc-custom-logo"
                    :logo-data="customLogo"
                />
            </q-toolbar>
            <q-toolbar
                v-show="!menuPinned"
                inset
            >
                <q-item
                    class="bg-secondary q-pa-none"
                >
                    <q-item-section>
                        <q-item-label
                            class="text-h6"
                        >
                            {{ route.meta.title }}
                        </q-item-label>
                        <q-item-label
                            v-if="route.meta.subtitle"
                            class="text-subtitle2"
                        >
                            {{ route.meta.subtitle }}
                        </q-item-label>
                    </q-item-section>
                </q-item>
            </q-toolbar>
        </q-header>
        <q-drawer
            id="csc-drawer-left"
            ref="mainMenu"
            v-model="menuClosed"
            :mini="menuMinimized"
            class="bg-main-menu"
            :behavior="drawerBehavior"
            show-if-above
            :width="316"
            @mouseleave="minimizeMenu"
            @mouseenter="maximizeMenu"
            @on-layout="layoutResized"
        >
            <div
                v-if="$q.platform.is.desktop"
                :class="pinMenuButtonClasses"
            >
                <div
                    class="col col-auto"
                >
                    <q-btn
                        v-if="!menuMinimized"
                        :icon="pinMenuButtonIcon"
                        color="white"
                        flat
                        dense
                        round
                        @click="pinMenu"
                    />
                </div>
            </div>
            <csc-selection-language-mobile
                v-if="$q.platform.is.mobile"
                id="csc-language-menu-main-mobile"
                class="csc-language-menu"
            />
            <q-scroll-area
                class="absolute-top main-menu-container"
                :style="{ bottom: mainMenuBottom }"
            >
                <csc-main-menu-top
                    id="csc-main-menu-top"
                    class="csc-main-menu no-margin"
                    :call-state-title="callStateTitle"
                    :call-state-subtitle="callStateSubtitle"
                    :is-call-forward="isCallForward"
                    :is-call-blocking="isCallBlocking"
                    :is-pbx-admin="isPbxAdmin"
                    :is-pbx-configuration="isPbxConfiguration"
                />
            </q-scroll-area>
            <aui-mobile-app-badges
                class="app-mobile-badge-height"
                :style="{ bottom: appBadgeBottom }"
            />
            <div
                v-if="!menuMinimized && platformInfo.type === 'spce'"
                class="absolute-bottom-left absolute-bottom-right bottom-text"
            >
                <div>
                    <div class="row justify-center content-center">
                        <span
                            class="no-wrap q-mr-xs"
                        >
                            {{ $t('Powered by') }}
                            <a
                                class="text-primary"
                                href="http://www.sipwise.com"
                            >Sipwise</a>
                        </span>
                    </div>
                </div>
            </div>
        </q-drawer>
        <q-page-container
            id="csc-page-main"
        >
            <router-view />
        </q-page-container>
        <csc-send-fax
            ref="faxDialog"
        />
        <csc-call
            v-if="hasSubscriberProfileAttribute('csc_calls')"
            id="csc-call"
            ref="call"
            :call-state="callState"
            :call-number="number"
            :phonebook-entry-name="phonebookEntryName"
            :number-input="numberInput"
            :ended-reason="endedReason"
            :full-view="isFullView"
            :minimized="!isHome && !maximized"
            :maximizable="!isHome"
            :closed="!isCalling && !isHome"
            :local-media-stream="getLocalMediaStream"
            :remote-media-stream="getRemoteMediaStream"
            :is-video-call="hasVideo"
            :has-local-video="hasLocalVideo"
            :has-remote-video="hasRemoteVideo"
            :microphone-enabled="microphoneEnabled"
            :camera-enabled="cameraEnabled"
            :screen-enabled="screenEnabled"
            :hold-enabled="holdEnabled"
            :transfer-enabled="transferEnabled"
            :local-on-hold="localOnHold"
            :remote-on-hold="remoteOnHold"
            :remote-volume-enabled="remoteAudioEnabled"
            :dialpad-opened="dialpadOpened"
            :menu-minimized="menuMinimized"
            @start-call="startCall"
            @accept-call="acceptCall"
            @end-call="endCall"
            @close-call="closeCall"
            @toggle-microphone="toggleMicrophone"
            @toggle-holdon="toggleHoldon"
            @toggle-state-transfer="toggleStateTransfer"
            @toggle-camera="toggleCamera"
            @toggle-screen="toggleScreen"
            @toggle-remote-volume="toggleRemoteAudio"
            @click-dialpad="clickDialpad"
            @toggle-dialpad="toggleDialpad"
            @maximize-call="maximizeCall"
            @minimize-call="minimizeCall"
            @add-camera="toggleCamera"
        />
    </q-layout>
</template>

<script>
import AuiMobileAppBadges from 'components/AuiMobileAppBadges'
import CscCustomLogo from 'components/CscCustomLogo'
import CscDialogQrCode from 'components/CscDialogQrCode'
import CscLogo from 'components/CscLogo'
import CscMainMenuTop from 'components/CscMainMenuTop'
import CscPopupMenu from 'components/CscPopupMenu'
import CscPopupMenuItem from 'components/CscPopupMenuItem'
import CscSelectionLanguage from 'components/CscSelectionLanguage'
import CscSelectionLanguageMobile from 'components/CscSelectionLanguageMobile'
import CscSendFax from 'components/CscSendFax'
import CscUserMenu from 'components/CscUserMenu'
import CscCall from 'components/call/CscCall'
import _ from 'lodash'
import { setCssVar } from 'quasar'
import {
    callGetLocalMediaStream,
    callGetRemoteMediaStream,
    callHasRemoteVideo
} from 'src/api/ngcp-call'
import { normalizeDestination } from 'src/filters/number-format'
import { startCase } from 'src/filters/string'
import {
    enableIncomingCallNotifications,
    showGlobalError,
    showToast,
    startLoading,
    stopLoading
} from 'src/helpers/ui'
import platformMixin from 'src/mixins/platform'
import {
    CallState,
    CallStateTitle
} from 'src/store/call/common'
import {
    mapActions,
    mapGetters,
    mapState
} from 'vuex'

export default {
    name: 'CscLayoutMain',
    components: {
        CscSelectionLanguage,
        CscSelectionLanguageMobile,
        AuiMobileAppBadges,
        CscPopupMenuItem,
        CscPopupMenu,
        CscMainMenuTop,
        CscCall,
        CscSendFax,
        CscLogo,
        CscCustomLogo,
        CscUserMenu
    },
    mixins: [
        platformMixin
    ],
    emits: ['window-resized', 'orientation-changed'],
    data () {
        return {
            header: true,
            menuClosed: false,
            menuPinned: true,
            menuMinimized: false,
            sideStates: {
                left: true,
                right: false
            },
            mobileMenu: null,
            customLogo: null,
            menuPinnedBBeforeCall: true
        }
    },
    computed: {
        ...mapState([
            'route'
        ]),
        ...mapState('call', [
            'callEnabled',
            'callState',
            'number',
            'numberInput',
            'phonebookEntryName',
            'endedReason',
            'localMediaStream',
            'remoteMediaStream',
            'cameraEnabled',
            'screenEnabled',
            'holdEnabled',
            'transferEnabled',
            'microphoneEnabled',
            'remoteAudioEnabled',
            'maximized',
            'dialpadOpened',
            'localOnHold',
            'remoteOnHold'
        ]),
        ...mapGetters('user', [
            'getUsername',
            'isPbxAdmin',
            'isFaxFeatureEnabled',
            'isFaxServerSettingsActive',
            'userDataSucceeded',
            'isLogoRequested',
            'hasSubscriberProfileAttribute'
        ]),
        ...mapState('user', [
            'resellerBranding',
            'defaultBranding',
            'platformInfo'
        ]),
        ...mapState('communication', [
            'createFaxState',
            'createFaxError'
        ]),
        showQrBtn () {
            return this.platformInfo?.app?.show_qr
        },
        isMenuClosed () {
            return !this.sideStates.left
        },
        isFullView () {
            return this.isMenuClosed || this.isMobile || this.mobileMenu
        },
        pinMenuButtonIcon () {
            if (!this.menuPinned) {
                return 'push_pin'
            }
            return 'arrow_left'
        },
        pinMenuButtonClasses () {
            const classes = ['pin-menu-button row items-center']
            if (!this.menuMinimized) {
                classes.push('justify-end')
                classes.push('q-pl-sm q-pr-sm')
            } else {
                classes.push('justify-center')
            }
            return classes
        },
        drawerBehavior () {
            if (this.$q.platform.is.mobile) {
                return 'mobile'
            }
            return 'desktop'
        },
        isHome () {
            return this.route?.path === '/user/home'
        },
        isCallForward () {
            return _.startsWith(this.route?.path, '/user/call-forward')
        },
        isCallBlocking () {
            return _.startsWith(this.route?.path, '/user/call-blocking')
        },
        isPbxConfiguration () {
            return _.startsWith(this.route?.path, '/user/pbx-configuration')
        },
        isCalling () {
            return this.callState === 'initiating' ||
                this.callState === 'ringing' ||
                this.callState === 'established' ||
                this.callState === 'incoming' ||
                this.callState === 'ended' ||
                this.callState === 'hold'
        },
        getLocalMediaStream () {
            if (this.localMediaStream) {
                return callGetLocalMediaStream()
            }
            return null
        },
        getRemoteMediaStream () {
            if (this.remoteMediaStream) {
                return callGetRemoteMediaStream()
            }
            return null
        },
        hasRemoteVideo () {
            if (this.remoteMediaStream !== null) {
                return callHasRemoteVideo()
            }
            return null
        },
        hasLocalVideo () {
            if (this.localMediaStream !== null) {
                return this.screenEnabled || this.cameraEnabled
            }
            return null
        },
        hasVideo () {
            return this.hasLocalVideo || this.hasRemoteVideo
        },
        callStateTitle () {
            return CallStateTitle[this.callState]
        },
        callStateSubtitle () {
            if (this.callState === CallState.initiating ||
                this.callState === CallState.ringing ||
                this.callState === CallState.incoming ||
                this.callState === CallState.hold ||
                this.callState === CallState.established) {
                return this.callNumberFormatted
            } else if (this.callState === CallState.ended) {
                return this.callEndedReasonFormatted
            }
            return ''
        },
        callNumberFormatted () {
            return this.phonebookEntryName || normalizeDestination(this.number)
        },
        callEndedReasonFormatted () {
            return startCase(this.endedReason)
        },
        mainMenuBottom () {
            const appUrlApple = this.platformInfo?.app?.apple?.url
            const appUrlAndroid = this.platformInfo?.app?.android?.url
            const copyrightIsDisplayed = !this.menuMinimized && this.platformInfo?.type === 'spce'
            if ((appUrlApple || appUrlAndroid) && copyrightIsDisplayed) {
                return '205px'
            } else if (appUrlApple || appUrlAndroid) {
                return '160px'
            } else if (copyrightIsDisplayed) {
                return '45px'
            }
            return '0px'
        },
        appBadgeBottom () {
            const copyrightIsDisplayed = !this.menuMinimized && this.platformInfo?.type === 'spce'
            if (copyrightIsDisplayed) {
                return '45px'
            }
            return '0px'
        }
    },
    watch: {
        callState (state) {
            if (state === 'established') {
                this.menuPinnedBBeforeCall = this.menuPinned
                this.menuPinned = false
                this.menuMinimized = true
                this.header = true
            } else if (state === 'ended') {
                if (this.menuPinnedBBeforeCall) {
                    this.menuPinned = true
                    this.menuMinimized = false
                }
                this.header = true
            } else {
                this.header = true
            }
        },
        route: {
            handler (val, oldVal) {
                if (val?.path === '/user/home') {
                    this.$store.commit('call/minimize')
                }
            },
            deep: true,
            immediate: true
        },
        userDataSucceeded (userDataSucceeded) {
            if (userDataSucceeded) {
                enableIncomingCallNotifications()

                this.updateBrandings()
            }
        },
        callEnabled (value) {
            if (value) {
                showToast(this.$t('You are now able to start and receive calls'))
            }
        },
        createFaxState (state) {
            if (state === 'requesting') {
                startLoading()
            } else if (state === 'failed') {
                stopLoading()
                showGlobalError(this.createFaxError)
            } else if (state === 'succeeded') {
                stopLoading()
                showToast(this.$t('Sending fax completed successfully.'))
                this.hideSendFax()
            }
        },
        $route (route) {
            if (!this.isHome) {
                this.$store.commit('call/minimize')
            }
            if (this.$refs.call) {
                this.$nextTick(() => {
                    this.$refs.call.fitMedia()
                })
            }
            window.scrollTo(0, 0)
        }
    },
    async mounted () {
        window.addEventListener('orientationchange', () => {
            this.emitter.$emit('orientation-changed')
        })
        window.addEventListener('resize', () => {
            this.emitter.$emit('window-resized')
        })
        this.updateBrandings()
        this.customLogo = await this.$store.dispatch('user/getCustomLogo')
    },
    methods: {
        ...mapActions('user', [
            'fetchAuthToken'
        ]),
        ...mapActions('call', [
            'toggleCamera',
            'toggleScreen',
            'toggleMicrophone',
            'toggleHoldon',
            'toggleStateTransfer',
            'toggleRemoteAudio'
        ]),
        layoutResized () {
            if (this.$refs.call) {
                this.$nextTick(() => {
                    this.$refs.call.fitMedia()
                })
            }
        },
        pinMenu () {
            this.menuPinned = !this.menuPinned
            if (this.menuPinned === false) {
                this.menuMinimized = true
            }
        },
        minimizeMenu () {
            if (!this.menuPinned) {
                this.menuMinimized = true
            }
            this.layoutResized()
        },
        maximizeMenu () {
            if (!this.menuPinned) {
                this.menuMinimized = false
            }
            this.layoutResized()
        },
        showSendFax () {
            this.$refs.faxDialog.show()
        },
        hideSendFax () {
            this.$refs.faxDialog.hide()
        },
        startCall (localMedia) {
            if ((this.$route.query.number !== '' && this.$route.query.number !== null) || (this.numberInput !== '' && this.numberInput !== null)) {
                this.$store.dispatch('call/start', localMedia)
            }
        },
        acceptCall (localMedia) {
            this.$store.dispatch('call/accept', localMedia)
        },
        closeCall () {
            this.$store.commit('call/inputNumber')
        },
        endCall () {
            this.$store.dispatch('call/end')
            if (this.menuPinnedBBeforeCall) {
                this.menuPinned = true
                this.menuMinimized = false
                this.header = true
            }
        },
        clickDialpad (value) {
            this.$store.dispatch('call/sendDTMF', value)
        },
        toggleDialpad () {
            this.$store.commit('call/toggleDialpad')
        },
        maximizeCall () {
            if (this.isMobile) {
                this.$router.push({ path: '/user/home' })
            } else {
                this.$store.commit('call/maximize')
            }
        },
        minimizeCall () {
            this.$store.commit('call/minimize')
        },
        leftBreakpoint (enabled) {
            this.mobileMenu = !enabled
        },
        toggleMenu () {
            this.menuMinimized = !this.menuMinimized
        },
        sideStateLeft () {
            return this.sideStates.left
        },
        updateBrandings () {
            const primaryColor = this.resellerBranding?.csc_color_primary || this.defaultBranding?.primaryColor
            const secondaryColor = this.resellerBranding?.csc_color_secondary || this.defaultBranding?.secondaryColor
            if (primaryColor) {
                setCssVar('primary', primaryColor)
            }
            if (secondaryColor) {
                setCssVar('secondary', secondaryColor)
            }
            let customCss = document.getElementById('csc-custom-css')
            if (!customCss && this.resellerBranding?.css) {
                customCss = document.createElement('style')
                customCss.id = 'csc-custom-css'
                customCss.textContent = this.resellerBranding.css
                document.body.appendChild(customCss)
            }
        },
        async showQrDialog () {
            await this.fetchAuthToken()
            this.$q.dialog({
                component: CscDialogQrCode,
                parent: this
            })
        }
    }
}
</script>

<style lang="sass" rel="stylesheet/sass">
$copyright-height: 45px
.app-badge
    width: 60% !important

.pin-menu-button
    height: $header-height
#csc-header-toolbar
    background-color: $secondary
#csc-main-logo
    height: 52px
    width: auto
    right: 12px
    top: 4px
    position: absolute
.csc-user-menu-button
    margin-left: 0
    margin-right: 0.2rem
    padding: 0.2rem
    .on-left
        margin: 0
    .csc-username
        padding-left: 3px
        font-weight: normal
        color: rgba(255,255,255,0.6)
.page.page-call-active
    padding-bottom: 120px
#main-menu
    padding: 0
    .q-item
        padding-top: $flex-gutter-xs * 1.4
        padding-bottom:  $flex-gutter-xs * 1.4
        .q-item-side-left
            min-width: auto
        .q-item-main
            margin-left: $flex-gutter-sm
        .q-icon
            color: $main-menu-icon-color
        .q-item-label
            color: $main-menu-title-color
            font-weight: bold
            white-space: nowrap
        .q-item-sublabel
            color: $main-menu-subtitle-color
    .q-item:hover
        background-color: $main-menu-item-hover-background
    .q-item.router-link-active
        .q-icon
            color: $main-menu-icon-active-color
        .q-item-label
            color: $main-menu-title-active-color
            font-weight: bold
        .q-item-sublabel
            color: $main-menu-subtitle-active-color
        background-color: transparent
#user-login-as
    display: inline-block
    text-transform: none
#user-login-as:after
    content: " "
    white-space: pre
#user-name
    font-weight: bold
.q-card
    margin: 15px
    margin-left: 0
    margin-right: 0
.q-card.page
    padding: 0
    margin: 0
.q-if-control.q-if-control-before.q-icon,
.q-if-control.q-if-control-before.q-icon:before
    font-size: 24px
.csc-toolbar-btn-popover
    .q-item-main.q-item-section
        margin-left: 0
.q-toolbar
    .csc-toolbar-btn.q-btn
        padding-left: 8px
        padding-right: 8px
    .csc-toolbar-btn-right
        .csc-toolbar-btn-icon
            margin-right: 8px
.csc-layout-call-active
    padding-bottom: 152px
#csc-header
    position: fixed
    top: 0
    left: $layout-aside-left-width
    right: 0
    height: $header-height
    overflow: hidden
    z-index: 100
    background-color: $secondary
    .csc-header-content
        position: absolute
        top: 0
        right: 0
        left: 0
        bottom: 0
        padding: $logo-margin
        background: linear-gradient(to bottom, rgba(21,29,48,0.5) 0%,rgba(21,29,48,0) 75%,rgba(21,29,48,0) 100%)
#csc-header.csc-header-full
    left: 0
#csc-user-menu
    cursor: pointer
    display: inline-block
    .csc-username
        padding-left: 4px
.csc-toggle-menu
    cursor: pointer
    position: absolute
    top: $logo-margin
    right: $logo-margin
    display: flex
    justify-content: center
    align-items: center
    width: 40px
    height: 40px
    .q-icon
        display: flex
        position: relative
        font-size: 24px
.layout-aside-left
    padding-top: $header-height
.csc-menu-minimized
    .layout-aside-left
        width: $main-menu-minimized-width
        .q-item-main
            display: none
    .csc-toggle-menu
        width: $main-menu-minimized-width
        left: 0
    #main-menu
        .q-collapsible
            .q-collapsible-sub-item
                padding: 0
    #csc-header
        left: $main-menu-minimized-width
.mobile
    .layout-aside-left
        width: auto
        right: 0
.csc-subitem-label
    padding-left: 20px
.csc-toolbar-btn-popover
    .q-collapsible-sub-item
        padding: 0 16px 0 16px
.csc-collapsible-menu
    .q-icon
        display: none
#csc-default-logo
        height: 48px
#csc-custom-logo
        min-width: $logo-min-width
        max-width: $logo-max-width
        max-height: $logo-max-height
.bottom-text
    height: $copyright-height
    text-align: center

.main-menu-container
    top: $toolbar-min-height

.app-mobile-badge-height
    height: 160px
</style>
