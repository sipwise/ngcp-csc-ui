<template>
    <q-slide-transition>
        <div
            class="csc-add-button row justify-center"
        >
            <q-btn
                color="primary"
                icon="add"
                flat
                @click="click"
            >
                {{ label }}
            </q-btn>
        </div>
    </q-slide-transition>
</template>

<script>
export default {
    name: 'CscListAddButton',
    props: {
        label: {
            type: String,
            default: ''
        }
    },
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
