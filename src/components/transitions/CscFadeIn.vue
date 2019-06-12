<template>
    <transition
        appear
        enter-active-class="animated fadeIn faster"
        leave-active-class="animated fadeOut faster"
    >
        <slot />
    </transition>
</template>

<script>
    export default {
        name: 'csc-fade-in',
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
