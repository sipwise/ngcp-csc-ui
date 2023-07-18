<template>
    <div
        class="csc-alert-info row no-vert-gutter no-wrap"
    >
        <div
            class="csc-alert-icon ol col-2"
        >
            <q-icon
                name="info"
                size="32px"
                color="white"
            />
        </div>
        <div
            class="csc-alert-info-text col-10"
        >
            <slot />
        </div>
    </div>
</template>

<script>
export default {
    name: 'CscAlertInfo',
    data () {
        return {}
    }
}
</script>

<style lang="sass" rel="stylesheet/sass">
    .csc-alert-info
        background-color: $info
        padding:  $flex-gutter-md
        margin-bottom: $flex-gutter-lg
        .csc-alert-icon
            text-align: left
        .csc-alert-info-text
            line-height: 1.4em
            color: $white
</style>
