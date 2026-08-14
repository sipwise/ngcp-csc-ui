<template>
    <q-toolbar>
        <q-space />
        <csc-input-date
            :value="value.from"
            class="q-mr-sm"
            data-cy="filter-from"
            dense
            :clearable="false"
            :label="$t('From')"
            :disable="loading"
            @input="inputFrom"
        />
        <csc-input-date
            :value="value.to"
            data-cy="filter-to"
            dense
            :clearable="false"
            :label="$t('To')"
            :disable="loading"
            @input="inputTo"
        />
        <q-space />
    </q-toolbar>
</template>

<script>
import CscInputDate from 'components/form/CscInputDate'
export default {
    name: 'CscConversationsFilter',
    components: {
        CscInputDate
    },
    props: {
        value: {
            type: Object,
            default () {
                return {
                    from: '',
                    to: ''
                }
            }
        },
        loading: {
            type: Boolean,
            default: false
        },
        disable: {
            type: Boolean,
            default: false
        }
    },
    emits: ['input'],
    methods: {
        inputFrom (from) {
            this.$emit('input', {
                from,
                to: this.value.to
            })
        },
        inputTo (to) {
            this.$emit('input', {
                from: this.value.from,
                to
            })
        }
    }
}
</script>
