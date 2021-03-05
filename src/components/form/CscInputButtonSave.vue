<template>
    <q-btn
        icon="check"
        color="primary"
        flat
        dense
        :label="$t('Save')"
        :disable="$attrs.loading"
        v-bind="$attrs"
        v-on="$listeners"
    />
</template>

<script>
export default {
    name: 'CscInputButtonSave'
}
</script>
