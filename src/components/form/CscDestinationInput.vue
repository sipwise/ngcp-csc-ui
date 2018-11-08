
<template>
    <q-input
        dark
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
        normalizeNumber,
        rawNumber
    } from '../../filters/number-format'
    import {
        QInput,
        Platform
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
                this.destination = normalizeNumber(value, Platform.is.mobile);
                this.$emit('input', rawNumber(this.destination));
            }
        }
    }
</script>

<style lang="stylus" rel="stylesheet/stylus">
</style>
