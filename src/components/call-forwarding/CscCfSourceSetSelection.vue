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
import { mapActions, mapGetters } from 'vuex'
export default {
    name: 'CscCfSourceSetSelection',
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
        ...mapGetters('callForwarding', [
            'sourceSets'
        ]),
        allOptions () {
            return this.sourceSets
                .filter((sourceSet) => sourceSet.mode === this.mode)
                .map((sourceSet) => ({
                    value: sourceSet.id,
                    label: sourceSet.name
                }))
        },
        filteredOptions () {
            return this.options.length ? this.options : this.allOptions
        }
    },
    async created () {
        await this.loadSourceSets()
        this.options = this.allOptions
    },
    methods: {
        ...mapActions('callForwarding', [
            'loadSourceSets'
        ]),
        async filter (value, update) {
            await this.loadSourceSets()
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
