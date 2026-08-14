<template>
    <q-tooltip
        ref="tooltip"
        :delay="delay"
        :content-class="contentClass"
        v-bind="$attrs"
        @show="autoHide"
        @hide="cancelAutoHide"
    >
        <slot />
    </q-tooltip>
</template>

<script>
export default {
    name: 'CscTooltip',
    props: {
        autoHideDelay: {
            type: Number,
            default: 5000
        },
        delay: {
            type: Number,
            default: 500
        },
        contentClass: {
            type: String,
            default: 'text-dark'
        }
    },
    data () {
        return {
            autoHideHandler: undefined
        }
    },
    beforeUnmount () {
        this.cancelAutoHide()
    },
    methods: {
        autoHide () {
            this.cancelAutoHide()
            this.autoHideHandler = setTimeout(
                () => {
                    this.autoHideHandler = undefined
                    this.$refs.tooltip.hide()
                },
                this.autoHideDelay
            )
        },
        cancelAutoHide () {
            clearTimeout(this.autoHideHandler)
        }
    }
}
</script>
