<template>
    <q-btn
        flat
        icon="check"
        color="primary"
        @click="click"
    >
        {{ $t('Save') }}
    </q-btn>
</template>

<script>
export default {
    name: 'CscFormSaveButton',
    emits: ['click'],
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

<style lang="sass" rel="stylesheet/sass">
</style>
