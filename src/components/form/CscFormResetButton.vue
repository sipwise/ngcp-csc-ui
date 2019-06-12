<template>
    <q-btn
        flat
        icon="undo"
        color="white"
        @click="click"
    >
        {{ $t('buttons.reset') }}
    </q-btn>
</template>

<script>
    import {
        QBtn
    } from 'quasar-framework'
    export default {
        name: 'csc-form-reset-button',
        data () {
            return {}
        },
        components: {
            QBtn
        },
        methods: {
            click() {
                this.$emit('click');
            }
        }
    }
</script>

<style lang="stylus" rel="stylesheet/stylus">
</style>
