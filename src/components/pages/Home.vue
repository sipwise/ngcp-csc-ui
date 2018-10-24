<template>
    <div
        class="csc-call-page row justify-center items-center"
    >
        <div
            class="col col-xs-12 col-md-6 col-lg-4"
        >
            <csc-phone-number-input
                class="csc-call-phone-number"
                :dark="false"
                :value="callNumberInput"
                @number-changed="numberInputChanged"
            />
        </div>
    </div>
</template>

<script>
    import {
        mapGetters
    } from 'vuex'
    import CscPage from '../CscPage'
    import CscPhoneNumberInput from "../call/CscPhoneNumberInput";
    export default {
        data() {
            return {
            }
        },
        components: {
            CscPhoneNumberInput,
            CscPage
        },
        methods: {
            numberInputChanged(number) {
                this.$store.commit('call/numberInputChanged', number);
            }
        },
        computed: {
            ...mapGetters('call', [
                'callNumberInput'
            ])
        }
    }
</script>

<style lang="stylus" rel="stylesheet/stylus">
    @import '../../themes/quasar.variables'
    .csc-call-page
        height calc(100vh - 120px)
        padding 0
    .csc-call-phone-number
        margin-top -80px
</style>
