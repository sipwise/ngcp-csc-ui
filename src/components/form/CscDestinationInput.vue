
<template>
    <q-input
        clearable
        type="text"
        :float-label="label"
        :value="destination"
        @input="inputDestination"
        @keyup.enter="submit"
        @keypress.space.prevent
        @keydown.space.prevent
    />
</template>

<script>
    import {
        rawNumber
    } from '../../filters/number-format'
    import {
        QInput
    } from 'quasar-framework'

    export default {
        name: 'csc-destination-input',
        props: {
            loading: Boolean,
            label: String
        },
        data () {
            return {
                destination: ''
            }
        },
        components: {
            QInput
        },
        methods: {
            submit() {
                this.$emit('submit');
            },
            inputDestination(value) {
                this.$emit('input', rawNumber(value));
            }
        }
    }
</script>

<style lang="stylus" rel="stylesheet/stylus">
</style>
