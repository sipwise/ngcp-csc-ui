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
    name: 'CscFadeUp',
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
