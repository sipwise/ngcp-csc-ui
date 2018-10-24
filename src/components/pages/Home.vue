<template>
    <div
        class="csc-call-page row justify-center"
    >
        <div
            class="col col-xs-12 col-md-6 col-lg-4"
        >
            <csc-phone-number-input
                :dark="false"
                @number-changed="numberInputChanged"
            />
        </div>
    </div>
</template>

<script>
    import CscPage from '../CscPage'
    import CscPhoneNumberInput from "../call/CscPhoneNumberInput";
    export default {
        data() {
            return {
            }
        },
        props: [
        ],
        components: {
            CscPhoneNumberInput,
            CscPage
        },
        mounted() {
        },
        computed: {
        },
        methods: {
            numberInputChanged(number) {
                this.$store.commit('call/numberInputChanged', number);
            }
        }
    }
</script>

<style lang="stylus" rel="stylesheet/stylus">
    @import '../../themes/quasar.variables'

    .csc-call-page
        padding-top 15%

</style>
