<template>
    <csc-page
        class="csc-simple-page"
    >
        <div
            :class="pageClasses"
        >
            <div
                class="col col-xs-12 col-md-6 col-lg-4"
            >
                <q-alert
                    v-if="!isCallInitializing && desktopSharingInstall"
                    v-model="desktopSharingInstall"
                    color="warning"
                    :actions="desktopSharingAlertActions"
                >
                    {{ $t('call.desktopSharingNotInstalled') }}
                </q-alert>
                <q-alert
                    v-if="!isCallInitializing && !hasRtcEngineCapabilityEnabled"
                    class="csc-inline-alert"
                    appear
                    icon="info"
                    color="info"
                    :actions="rtcEngineInfoActions"
                >
                    {{ $t('call.rtcEngineNotEnabled') }}
                </q-alert>
                <div
                    v-if="isCallInitializing"
                    class="csc-main-spinner"
                >
                    <q-spinner-dots
                        size="32px"
                        color="primary"
                    />
                </div>
                <csc-phone-number-input
                    v-if="!isCallInitializing"
                    class="csc-call-phone-number"
                    :dark="true"
                    :value="callNumberInput"
                    :readonly="dialpadOpened"
                    :enabled="isCallEnabled"
                    @number-changed="numberInputChanged"
                />
                <csc-call-dialpad
                    v-if="dialpadOpened && isCallEnabled"
                    :show-backspace-button="true"
                    :show-clear-button="true"
                    @click="dialpadClick"
                    @remove="remove"
                    @remove-all="removeAll"
                />
            </div>
        </div>
    </csc-page>
</template>

<script>
    import platformMixin from '../../mixins/platform'
    import {
        getChromeExtensionUrl
    } from '../../helpers/cdk-lib'
    import {
        mapGetters
    } from 'vuex'
    import CscPage from '../CscPage'
    import CscPhoneNumberInput from "../call/CscPhoneNumberInput";
    import CscCallDialpad from "../CscCallDialpad";
    import {
        QIcon,
        QAlert,
        QSpinnerDots,
        QBtn
    } from 'quasar-framework'
    export default {
        data() {
            return {
            }
        },
        mixins: [
            platformMixin
        ],
        components: {
            CscPhoneNumberInput,
            CscCallDialpad,
            CscPage,
            QIcon,
            QAlert,
            QSpinnerDots,
            QBtn
        },
        props: [
        ],
        methods: {
            numberInputChanged(number) {
                this.$store.commit('call/numberInputChanged', number);
            },
            dialpadClick(value) {
                let number = this.callNumberInput + value;
                this.$store.commit('call/numberInputChanged', number);
            },
            remove() {
                let number = this.callNumberInput.slice(0, -1);
                this.$store.commit('call/numberInputChanged', number);
            },
            removeAll() {
                this.$store.commit('call/numberInputChanged', '');
            }
        },
        computed: {
            ...mapGetters('call', [
                'callState',
                'callNumberInput',
                'hasRtcEngineCapabilityEnabled',
                'desktopSharingInstall',
                'isCallEnabled',
                'isCallInitializing'
            ]),
            dialpadOpened() {
                return this.callState == 'input' &&
                    !this.isCallInitializing &&
                    this.isMobile &&
                    this.hasRtcEngineCapabilityEnabled;
            },
            rtcEngineInfoActions() {
                return [];
            },
            desktopSharingAlertActions() {
                let self = this;
                return [
                    {
                        label: this.$t('buttons.install'),
                        handler () {
                            self.$store.commit('call/desktopSharingInstallReset');
                            window.open(getChromeExtensionUrl());
                        }
                    },
                    {
                        label: this.$t('buttons.cancel'),
                        handler () {
                            self.$store.commit('call/desktopSharingInstallReset');
                        }
                    }
                ]
            },
            pageClasses() {
                let classes = ["row", "justify-center"];
                if(this.isMobile) {
                    classes.push('items-end');
                    classes.push('csc-call-page-mobile');
                }
                else {
                    classes.push('items-center');
                    classes.push('csc-call-page-mobile');
                }
                return classes;
            }
        }
    }
</script>

<style lang="stylus" rel="stylesheet/stylus">
    @import '../../themes/quasar.variables'
    .csc-call-page-mobile
        min-height calc(100vh - 203px)
    .csc-call-page
        .csc-communication-actions
            position absolute
            top $header-height
            right 0
            left 0
            .q-btn
                box-shadow none
                .q-btn-inner
                    color $dark
    .csc-info
        background-color $info
        padding  $flex-gutter-md
        margin-bottom $flex-gutter-lg
        .csc-info-text
            line-height 1.4em
            color $white
</style>
