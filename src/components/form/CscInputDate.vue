<template>
    <csc-input
        :value="value"
        v-bind="$attrs"
        @click="$refs.popupTime.show()"
        @input="$emit('input', $event)"
    >
        <template
            v-slot:prepend
        >
            <q-btn
                icon="date_range"
                color="primary"
                dense
                flat
            >
                <q-popup-proxy
                    ref="popupTime"
                >
                    <q-date
                        :value="value"
                        mask="YYYY-MM-DD"
                        color="primary"
                        @input="$emit('input', $event); $refs.popupTime.hide()"
                    />
                </q-popup-proxy>
            </q-btn>
        </template>
    </csc-input>
</template>

<script>
import CscInput from 'components/form/CscInput'
export default {
    name: 'CscInputDate',
    components: { CscInput },
    props: {
        value: {
            type: String,
            default: undefined
        }
    },
    data () {
        return {}
    }
}
</script>
