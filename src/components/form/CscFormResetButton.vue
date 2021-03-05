<template>
    <q-btn
        flat
        icon="undo"
        color="white"
        @click="click"
    >
        {{ $t('Reset') }}
    </q-btn>
</template>

<script>
export default {
    name: 'CscFormResetButton',
    data () {
        return {}
    },
    methods: {
        click () {
            this.$emit('click')
        }
    }
}
</script>

<style lang="stylus" rel="stylesheet/stylus">
</style>
