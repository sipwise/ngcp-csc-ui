<template>
    <q-toggle
        v-model="toggleState"
        :label="label"
        @update:model-value="toggle()"
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
    emits: ['change'],
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

<style lang="sass" rel="stylesheet/sass">
</style>
