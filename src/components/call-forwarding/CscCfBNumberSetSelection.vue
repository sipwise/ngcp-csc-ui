<template>
    <q-select
        :value="value"
        :options="filteredOptions"
        emit-value
        use-input
        map-options
        input-debounce="300"
        v-bind="$attrs"
        @filter="filter"
    />
</template>
<script>
import { mapActions, mapState } from 'vuex'
export default {
    name: 'CscCfBNumberSetSelection',
    props: {
        value: {
            type: [String, Number],
            default: undefined
        },
        mode: {
            type: String,
            required: true
        }
    },
    data () {
        return {
            options: []
        }
    },
    computed: {
        ...mapState('callForwarding', [
            'bNumberSets'
        ]),
        allOptions () {
            return this.bNumberSets
                .filter((bNumberSet) => bNumberSet.mode === this.mode)
                .map((bNumberSet) => ({
                    value: bNumberSet.id,
                    label: bNumberSet.name
                }))
        },
        filteredOptions () {
            return this.options.length ? this.options : this.allOptions
        }
    },
    async created () {
        await this.loadBNumberSets()
        this.options = this.allOptions
    },
    methods: {
        ...mapActions('callForwarding', [
            'loadBNumberSets'
        ]),
        async filter (value, update) {
            await this.loadBNumberSets()
            update(() => {
                if (!value) {
                    this.options = this.allOptions
                } else {
                    const lowerCaseValue = value.toLowerCase()
                    this.options = this.allOptions.filter((option) =>
                        option.label.toLowerCase().startsWith(lowerCaseValue)
                    )
                }
            })
        }
    }
}
</script>
