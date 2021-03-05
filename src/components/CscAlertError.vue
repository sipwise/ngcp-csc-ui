<template>
    <div
        class="csc-alert-error row no-vert-gutter no-wrap"
    >
        <div
            class="col col-2"
        >
            <q-icon
                name="error"
                size="32px"
                color="white"
            />
        </div>
        <div
            class="csc-alert-error-text"
        >
            <slot />
        </div>
    </div>
</template>

<script>
export default {
    name: 'CscAlertError',
    data () {
        return {}
    }
}
</script>

<style lang="stylus" rel="stylesheet/stylus">
    .csc-alert-error
        background-color $negative
        padding  $flex-gutter-md
        margin-bottom $flex-gutter-lg
        .csc-alert-error-text
            line-height 1.4em
            color $white
</style>
