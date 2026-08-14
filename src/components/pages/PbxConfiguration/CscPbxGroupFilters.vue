<template>
    <div>
        <div
            class="row justify-center full-width q-gutter-x-sm"
        >
            <div
                class="col-xs-12 col-md-3"
            >
                <q-select
                    v-model="filterTypeModel"
                    dense
                    :options="filterTypeOptions"
                    :label="$t('Filter by')"
                    :disable="loading"
                    data-cy="filter-type"
                />
            </div>
            <div
                class="col-xs-12 col-md-3"
            >
                <q-input
                    v-model="typedFilter"
                    type="text"
                    dense
                    :disable="loading || filterType === null"
                    :label="(filterType === null) ? $t('Type something') : filterTypeModel.label"
                    data-cy="filter-value"
                    @keypress.enter="triggerFilter"
                >
                    <template
                        #append
                    >
                        <q-btn
                            icon="search"
                            color="primary"
                            dense
                            flat
                            :disable="loading"
                            data-cy="filter-btn-search"
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
                    v-for="({ filterInfo, id }) in filtersList"
                    :key="id"
                    :label="filterInfo"
                    :disable="false"
                    icon="filter_alt"
                    removable
                    dense
                    color="primary"
                    text-color="dark"
                    data-cy="filter-applied-item"
                    @remove="removeFilter(id)"
                />
            </div>
        </div>
    </div>
</template>

<script>
import _ from 'lodash'
export default {
    name: 'CscPbxGroupFilters',
    props: {
        loading: {
            type: Boolean,
            default: false
        }
    },
    emits: ['filter'],
    data () {
        return {
            filterTypeModel: null,
            typedFilter: null,
            filters: []
        }
    },
    computed: {
        filterType () {
            return this.filterTypeModel && this.filterTypeModel.value
        },
        filterTypeOptions () {
            return [
                {
                    label: this.$t('Group Name'),
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
                    label: this.$t('Alias Numbers'),
                    value: 'alias'
                }
            ]
        },
        filtersList () {
            return this.filters.map((filterItem) => {
                const filterDisplayValue = filterItem.value
                return {
                    id: filterItem.name,
                    filterInfo: `${this.filterTypeOptions.find((option) => option.value === filterItem.name).label}: ${filterDisplayValue}`
                }
            })
        }
    },
    watch: {
        filterTypeModel () {
            this.typedFilter = null
        }
    },
    methods: {
        triggerFilter (data) {
            this.addFilter(this.filterTypeModel?.value, this.typedFilter)
        },
        removeFilter (name) {
            this.filters = this.filters.filter((item) => item.name !== name)
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
                this.typedFilter = null
                this.filters = this.filters.filter((item) => item.name !== name)
                const filter = {
                    name,
                    value: valueTrimmed
                }
                this.filters.push(filter)
                this.filter()
            }
        },
        filter () {
            const params = {}
            this.filters.forEach((filter) => {
                params[filter.name] = filter.value
            })
            this.$emit('filter', params)
        }
    }
}
</script>
