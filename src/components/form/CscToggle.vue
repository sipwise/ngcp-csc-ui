<template>
    <q-toggle
        v-model="toggleState"
        :label="label"
        @input="toggle()"
    />
</template>

<script>
export default {
    name: 'CscToggle',
    props: {
        enabled: {
            type: Boolean,
            default: false
        },
        label: {
            type: String,
            default: ''
        }
    },
    data () {
        return {
            toggleState: this.enabled
        }
    },
    updated () {
        this.toggleState = this.enabled
    },
    methods: {
        toggle () {
            this.$emit('change', this.toggleState)
        }
    }
}
</script>

<style lang="stylus" rel="stylesheet/stylus">
</style>
