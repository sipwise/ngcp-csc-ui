<template>
    <csc-input
        :value="value"
        v-bind="$attrs"
        @click="loadFormattedDate(); $refs.popupTime.show()"
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
                @click="loadFormattedDate();"
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
import { mapGetters } from 'vuex'
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
    },
    computed: {
        ...mapGetters([
            'getCurrentFormattedDateWithDash'
        ])
    },
    methods: {
        loadFormattedDate () {
            const currentDate = this.getCurrentFormattedDateWithDash
            if (!this.value) {
                this.$emit('input', currentDate)
            }
        }
    }
}
</script>
