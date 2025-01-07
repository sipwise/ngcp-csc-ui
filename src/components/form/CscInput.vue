<template>
    <q-input
        :model-value="value"
        :clearable="false"
        v-bind="$attrs"
        @update:model-value="$emit('input', $event)"
    >
        <template
            v-for="(_, slot) of $slots"
            #[slot]="scope"
        >
            <slot
                v-if="slot !== 'loading'"
                :name="slot"
                v-bind="scope"
            />
        </template>
        <template
            #loading
        >
            <csc-spinner />
        </template>
        <template
            #append
        >
            <slot
                name="append"
            />
            <q-btn
                v-if="$attrs.clearable !== undefined && value !== undefined && value !== ''"
                icon="backspace"
                color="white"
                flat
                dense
                tabindex="-1"
                data-cy="field-delete"
                :disable="$attrs.disable"
                @click="clear"
            />
        </template>
    </q-input>
</template>

<script>
import CscSpinner from 'components/CscSpinner'
export default {
    name: 'CscInput',
    components: {
        CscSpinner
    },
    props: {
        value: {
            type: [String, Number],
            default: undefined
        }
    },
    emits: ['input', 'clear'],
    methods: {
        clear () {
            this.$emit('input', '')
            this.$emit('clear')
        }
    }
}
</script>
