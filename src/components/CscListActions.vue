<template>
    <div>
        <q-slide-transition
            appear
        >
            <slot
                name="slot1"
            />
        </q-slide-transition>
        <q-slide-transition
            appear
        >
            <slot
                name="slot2"
            />
        </q-slide-transition>
        <q-slide-transition
            appear
        >
            <slot
                name="slot3"
            />
        </q-slide-transition>
    </div>
</template>

<script>
export default {
    name: 'CscListActions',
    props: {
        label: {
            type: String,
            default: ''
        }
    },
    data () {
        return {}
    }
}
</script>

<style lang="sass" rel="stylesheet/sass">

.csc-list-actions
    margin-bottom: $flex-gutter-sm
</style>
