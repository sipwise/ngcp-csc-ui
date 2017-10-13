<template>
    <q-toggle
        :label="label"
        @input="toggle()"
        v-model="toggleState" />
</template>

<script>
    import { QToggle } from 'quasar-framework'
    export default {
        name: 'csc-toggle',
        props: [
            'enabled',
            'label'
        ],
        data () {
            return {
                toggleState: this.enabled,
            }
        },
        updated() {
            this.toggleState = this.enabled;
        },
        components: {
            QToggle
        },
        methods: {
            toggle() {
                this.$emit('change', this.toggleState);
            }
        }
    }
</script>

<style>
</style>
