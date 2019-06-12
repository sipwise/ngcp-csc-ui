<template>
    <q-btn
        flat
        icon="check"
        color="primary"
        @click="click"
    >
        {{ $t('buttons.save') }}
    </q-btn>
</template>

<script>
    import {
        QBtn
    } from 'quasar-framework'
    export default {
        name: 'csc-form-save-button',
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
