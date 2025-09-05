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
                    data-cy="csc-phonebook-search-filter"
                />
            </div>
            <div
                class="col-xs-12 col-md-2"
            >
                <q-select
                    v-if="filterType === 'shared'"
                    v-model="typedFilter"
                    :options="sharedFilterOptions"
                    dense
                    :disable="filterType === null"
                    :label="$t('Is shared?')"
                    data-cy="csc-phonebook-search-shared"
                    @update:model-value="triggerFilter"
                />
                <q-input
                    v-else
                    v-model="typedFilter"
                    type="text"
                    dense
                    :disable="filterType === null"
                    :label="$t('Type something')"
                    data-cy="csc-phonebook-entry-search-input"
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
export default {
    name: 'CscSubscriberFilters',
    emits: ['filter'],
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
                    value: 'name'
                },
                {
                    label: this.$t('Number'),
                    value: 'number'
                },
                {
                    label: this.$t('Shared'),
                    value: 'shared'
                }
            ]
        },
        sharedFilterOptions () {
            return [
                { label: this.$t('Yes'), value: '1' },
                { label: this.$t('No'), value: '0' }
            ]
        }
    },
    methods: {
        triggerFilter () {
            this.addFilter(this.filterType, this.typedFilter)
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
            const valueTrimmed = value?.value || value.trim()
            if (valueTrimmed) {
                this.typedFilter = ''
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
        },
        getFilterLabel (filterItem) {
            const filterNameTranslation = {
                name: this.$t('Name'),
                number: this.$t('Number'),
                shared: this.$t('Shared')
            }
            const filterNameTitle = filterNameTranslation[filterItem.name] || this.$t('Unknown name')

            if (filterItem.name === 'shared') {
                const yes = this.$t('Yes')
                const no = this.$t('No')
                return `${filterNameTitle}: ${filterItem.value === '1' ? yes : no}`
            }
            return `${filterNameTitle}: ${filterItem.value}`
        }
    }
}
</script>
