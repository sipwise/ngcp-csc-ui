<template>
    <div
        class="csc-call-page row justify-center items-center"
    >
        <div
            class="col col-xs-12 col-md-6 col-lg-4"
        >
            <div
                class="csc-call-page-content"
            >
                <csc-alert-info
                    v-if="!hasRtcEngineCapabilityEnabled"
                >
                    You can neither make a call nor receive one because the RTC:engine is not active.
                    If you operate a C5 CE then first upgrade to a C5 PRO to be able to use the RTC:engine.
                </csc-alert-info>
                <csc-phone-number-input
                    class="csc-call-phone-number"
                    :dark="false"
                    :value="callNumberInput"
                    :enabled="hasRtcEngineCapabilityEnabled"
                    @number-changed="numberInputChanged"
                />
            </div>
        </div>
    </div>
</template>

<script>
    import {
        mapGetters
    } from 'vuex'
    import CscPage from '../CscPage'
    import CscPhoneNumberInput from "../call/CscPhoneNumberInput";
    import {
        QIcon
    } from 'quasar-framework'
    import CscAlertError from "../CscAlertError"
    import CscAlertInfo from "../CscAlertInfo"
    export default {
        data() {
            return {
            }
        },
        components: {
            CscAlertError,
            CscAlertInfo,
            CscPhoneNumberInput,
            CscPage,
            QIcon
        },
        methods: {
            numberInputChanged(number) {
                this.$store.commit('call/numberInputChanged', number);
            }
        },
        computed: {
            ...mapGetters('call', [
                'callNumberInput',
                'hasCallInitError',
                'hasRtcEngineCapabilityEnabled'
            ])
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
