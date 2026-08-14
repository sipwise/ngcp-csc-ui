<template>
    <csc-input
        :value="value"
        v-bind="$attrs"
        @click="loadFormattedDate(); $refs.popupTime.show()"
        @input="$emit('input', $event)"
    >
        <template
            #prepend
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
                        v-model="date"
                        mask="YYYY-MM-DD"
                        color="primary"
                        @update:model-value="$emit('input', $event); $refs.popupTime.hide()"
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
    emits: ['input'],
    data () {
        return {
            date: null
        }
    },
    computed: {
        ...mapGetters([
            'getCurrentFormattedDateWithDash'
        ])
    },
    watch: {
        value (newValue) {
            this.date = newValue
        }
    },
    mounted () {
        this.date = this.value
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
