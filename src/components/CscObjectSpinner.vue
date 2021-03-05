<template>
    <q-inner-loading
        :visible="loading"
        :style="{zIndex: 12}"
    >
        <q-spinner-dots
            size="32px"
            color="primary"
        />
    </q-inner-loading>
</template>

<script>
export default {
    name: 'CscObjectSpinner',
    props: {
        loading: {
            type: Boolean,
            default: false
        }
    },
    data () {
        return {}
    }
}
</script>
