<template>
    <div
        class="csc-call-page row justify-center items-center"
    >
        <div
            class="col col-xs-10 col-md-6 col-lg-4"
        >
            <div
                class="csc-call-page-content"
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
                    :dark="false"
                    :value="callNumberInput"
                    :enabled="isCallInitialized"
                    @number-changed="numberInputChanged"
                />
            </div>
        </div>
    </div>
</template>

<script>
    import {
        getChromeExtensionUrl
    } from '../../helpers/cdk-lib'
    import {
        mapGetters
    } from 'vuex'
    import CscPage from '../CscPage'
    import CscPhoneNumberInput from "../call/CscPhoneNumberInput";
    import {
        QIcon,
        QAlert,
        QSpinnerDots
    } from 'quasar-framework'
    export default {
        data() {
            return {
            }
        },
        components: {
            CscPhoneNumberInput,
            CscPage,
            QIcon,
            QAlert,
            QSpinnerDots
        },
        methods: {
            numberInputChanged(number) {
                this.$store.commit('call/numberInputChanged', number);
            },
        },
        computed: {
            ...mapGetters('call', [
                'callNumberInput',
                'hasCallInitError',
                'hasRtcEngineCapabilityEnabled',
                'desktopSharingInstall',
                'isCallInitialized',
                'isCallInitializing'
            ]),
            rtcEngineInfoActions() {
                return [];
            },
            desktopSharingAlertActions() {
                let self = this;
                return [
                    {
                        label: 'Install',
                        handler () {
                            self.$store.commit('call/desktopSharingInstallReset');
                            window.open(getChromeExtensionUrl());
                        }
                    },
                    {
                        label: 'Cancel',
                        handler () {
                            self.$store.commit('call/desktopSharingInstallReset');
                        }
                    }
                ]
            }
        }
    }
</script>

<style lang="stylus" rel="stylesheet/stylus">
    @import '../../themes/quasar.variables'
    .csc-call-page
        height calc(100vh - 120px)
        padding 0
    .csc-call-page-content
        margin-top -80px
    .csc-info
        background-color $info
        padding  $flex-gutter-md
        margin-bottom $flex-gutter-lg
        .csc-info-text
            line-height 1.4em
            color $white
</style>
