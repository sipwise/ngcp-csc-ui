<template>
    <div>
        <div
            class="row justify-center full-width q-gutter-x-sm"
        >
            <div
                class="col-xs-12 col-md-2"
            >
                <q-select
                    v-model="filterType"
                    emit-value
                    map-options
                    dense
                    :options="filterTypeOptions"
                    :label="$t('Filter by')"
                />
            </div>
            <div
                class="col-xs-12 col-md-2"
            >
                <q-input
                    v-model="typedFilter"
                    type="text"
                    dense
                    :disable="filterType === null"
                    :label="$t('Type something')"
                    @keypress.enter="triggerFilter"
                >
                    <template
                        v-slot:append
                    >
                        <q-btn
                            icon="search"
                            color="primary"
                            dense
                            flat
                            @click="triggerFilter"
                        />
                    </template>
                </q-input>
            </div>
        </div>
        <div
            class="row justify-center full-width q-gutter-x-sm"
        >
            <div
                class="col-xs-12 col-md-4"
            >
                <q-chip
                    v-for="(filterItem, index) in filters"
                    :key="index"
                    :label="getFilterLabel(filterItem)"
                    :disable="false"
                    icon="filter_alt"
                    removable
                    dense
                    color="primary"
                    text-color="dark"
                    @remove="removeFilter(filterItem.name)"
                />
            </div>
        </div>
    </div>
</template>

<script>
import _ from 'lodash'
export default {
    name: 'CscPbxSeatFilters',
    data () {
        return {
            filterType: null,
            typedFilter: '',
            filters: []
        }
    },
    computed: {
        filterTypeOptions () {
            return [
                {
                    label: this.$t('Name'),
                    value: 'display_name'
                },
                {
                    label: this.$t('Extension'),
                    value: 'pbx_extension'
                },
                {
                    label: this.$t('Primary Number'),
                    value: 'primary_number'
                },
                {
                    label: this.$t('Alias Number'),
                    value: 'alias_number'
                }
            ]
        },
        getFilterLabel (filterItem) {
            const filterNameTranslation = {
                display_name: this.$t('Name'),
                pbx_extension: this.$t('Extension'),
                primary_number: this.$t('Primary Number'),
                alias_number: this.$t('Alias Number')
            }
            const filterNameTitle = filterNameTranslation[filterItem.name] || this.$t('Unknown name')
            return filterNameTitle + ': ' + filterItem.value
        }
    },
    methods: {
        triggerFilter () {
            this.addFilter(this.filterType, this.typedFilter)
        },
        removeFilter (name) {
            this.filters = this.filters.filter(item => item.name !== name)
            this.filter()
        },
        removeFilters () {
            if (this.filters.length > 0) {
                this.filters = []
                this.filter()
            }
        },
        addFilter (name, value) {
            const valueTrimmed = _.trim(value)
            if (valueTrimmed) {
                this.typedFilter = ''
                this.filters = this.filters.filter(item => item.name !== name)
                const filter = {
                    name: name,
                    value: valueTrimmed
                }
                this.filters.push(filter)
                this.filter()
            }
        },
        filter () {
            const params = {}
            this.filters.forEach(filter => {
                params[filter.name] = filter.value
            })
            this.$emit('filter', params)
        }
    }
}
</script>
