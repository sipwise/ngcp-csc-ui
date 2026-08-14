<template>
    <q-select
        ref="select"
        :value="$attrs.value"
        :options="filteredOptions"
        emit-value
        map-options
        use-input
        input-debounce="500"
        :loading="$wait.is(waitIdentifier) || $attrs.loading"
        v-bind="$attrs"
        @filter="filter"
    >
        <template
            #prepend
        >
            <slot
                name="prepend"
            />
            <q-icon
                v-if="icon"
                :name="icon"
            />
        </template>
        <template
            #append
        >
            <slot
                name="append"
            />
        </template>
        <template
            #after
        >
            <slot
                name="after"
            />
        </template>
    </q-select>
</template>

<script>
import _ from 'lodash'
export default {
    name: 'CscSelectLazy',
    props: {
        icon: {
            type: String,
            default: undefined
        },
        storeGetter: {
            type: String,
            required: true
        },
        storeAction: {
            type: String,
            required: true
        },
        storeActionParams: {
            type: Object,
            default: null
        },
        loadInitially: {
            type: Boolean,
            default: true
        },
        filterCustomizationFunction: {
            type: Function,
            default: (filter) => filter
        },
        initialOption: {
            type: Object,
            default: undefined
        }
    },
    data () {
        return {
            optionsWereUpdated: false
        }
    },
    computed: {
        filteredOptions () {
            let options = _.clone(this.$store.getters[this.storeGetter])
            if (options === undefined || options === null) {
                options = []
            }
            if (!this.optionsWereUpdated && this.initialOption && (options.length === 0 || options[0].disable === true)) {
                options.splice(0, 1, this.initialOption)
            }
            if (options.length === 0) {
                options.push({
                    label: this.$t('No data found'),
                    disable: true
                })
            }
            return options
        },
        waitIdentifier () {
            return this.$vnode.tag + this.$vnode.componentInstance?._uid
        }
    },
    mounted () {
        if (this.loadInitially) {
            this.filter('')
        }
    },
    methods: {
        async filter (filter, update, abort) {
            this.$wait.start(this.waitIdentifier)
            try {
                const filterFinalised = this.filterCustomizationFunction(filter)
                let options = filterFinalised
                if (_.isObject(this.storeActionParams)) {
                    options = _.merge(this.storeActionParams, {
                        filter: filterFinalised
                    })
                }
                await this.$store.dispatch(this.storeAction, options)
                this.optionsWereUpdated = true
                if (typeof update === 'function') {
                    update()
                }
            } catch (e) {
                if (typeof abort === 'function') {
                    abort()
                }
                throw e
            } finally {
                this.$wait.end(this.waitIdentifier)
            }
        }
    }
}
</script>
