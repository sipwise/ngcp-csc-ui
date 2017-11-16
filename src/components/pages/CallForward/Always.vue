<template>
    <csc-page title="Always">
    <div>
        <p>{{ count }}</p>
    </div>
    </csc-page>
</template>

<script>
    import CscPage  from '../../CscPage'
    export default {
        data () {
            return {}
        },
        components: {
            CscPage
        },
        computed: {
            count() {
                return this.$store.state.callForward.count;
            }
        }
    }
</script>

<style>
</style>
