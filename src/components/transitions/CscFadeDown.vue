<template>
    <transition
        appear
        enter-active-class="animated fadeInDown faster"
        leave-active-class="animated fadeOutUp faster"
    >
        <slot />
    </transition>
</template>

<script>
    export default {
        name: 'csc-fade-down',
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
