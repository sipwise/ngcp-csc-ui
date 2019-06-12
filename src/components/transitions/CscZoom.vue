<template>
    <transition
        appear
        enter-active-class="animated zoomIn faster"
        leave-active-class="animated zoomOut faster"
    >
        <slot />
    </transition>
</template>

<script>
    export default {
        name: 'csc-zoom',
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
