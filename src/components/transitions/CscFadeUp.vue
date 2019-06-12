<template>
    <transition
        appear
        enter-active-class="animated fadeInUp faster"
        leave-active-class="animated fadeOutDown faster"
    >
        <slot />
    </transition>
</template>

<script>
    export default {
        name: 'csc-fade-up',
        data () {
            return {}
        },
        components: {
        },
        computed: {
        },
        methods: {
        },
        watch: {
        }
    }
</script>

<style lang="stylus" rel="stylesheet/stylus">
    @import '../../themes/app.common.styl';
</style>
