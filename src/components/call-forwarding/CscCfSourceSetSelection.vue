<template>
    <q-select
        :value="value"
        :options="options"
        emit-value
        use-input
        map-options
        input-debounce="300"
        v-bind="$attrs"
        @filter="filter"
    />
</template>
<script>
import _ from 'lodash'
import {
    mapActions,
    mapState
} from 'vuex'
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
        ...mapState('callForwarding', [
            'sourceSets'
        ]),
        allOptions () {
            const options = []
            if (this.sourceSets) {
                this.sourceSets.forEach((sourceSet) => {
                    if (sourceSet.mode === this.mode) {
                        options.push({
                            value: sourceSet.id,
                            label: sourceSet.name
                        })
                    }
                })
            }
            return options
        }
    },
    methods: {
        ...mapActions('callForwarding', [
            'loadSourceSets'
        ]),
        async filter (value, update) {
            await this.loadSourceSets()
            if (value === '' || value === null || value === undefined) {
                update(() => {
                    this.options = this.allOptions
                })
            } else {
                update(() => {
                    this.options = this.allOptions.filter((sourceSet) =>
                        _.startsWith(_.lowerCase(sourceSet.label), _.lowerCase(value)))
                })
            }
        }
    }
}
</script>
