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
                <div
                    v-if="!hasRtcEngineCapabilityEnabled"
                    class="csc-info row no-vert-gutter no-wrap"
                >
                    <div
                        class="col col-2"
                    >
                        <q-icon
                            name="info"
                            size="32px"
                            color="white"
                        />
                    </div>
                    <div
                        class="csc-info-text col-10"
                    >You can neither make a call nor receive one because the RTC:engine is not active.
                        If you operate a C5 CE then first upgrade to a C5 PRO to be able to use the RTC:engine.</div>
                </div>
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
    export default {
        data() {
            return {
            }
        },
        components: {
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
                'hasCallInitFailure',
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
