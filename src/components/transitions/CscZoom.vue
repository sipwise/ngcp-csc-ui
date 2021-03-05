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
    name: 'CscZoom',
    components: {
    },
    data () {
        return {}
    },
    computed: {
    },
    watch: {
    },
    methods: {
    }
}
</script>
