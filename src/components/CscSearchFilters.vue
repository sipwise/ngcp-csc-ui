<template>
    <div>
        <div class="row justify-center full-width q-gutter-x-sm">
            <div class="col-xs-12 col-md-2">
                <q-select
                    v-model="filterType"
                    emit-value
                    map-options
                    dense
                    :options="filterOptions"
                    :label="$t('Filter by')"
                    :data-cy="`${dataCyPrefix}-filter`"
                />
            </div>
            <div class="col-xs-12 col-md-2">
                <q-input
                    v-model="typedFilter"
                    dense
                    :disable="filterType === null"
                    :label="$t('Type something')"
                    :data-cy="`${dataCyPrefix}-input`"
                    @keypress.enter="triggerFilter"
                >
                    <template #append>
                        <q-btn
                            icon="search"
                            color="primary"
                            dense flat
                            @click="triggerFilter" />
                    </template>
                </q-input>
            </div>
        </div>
        <div class="row justify-center full-width q-gutter-x-sm">
            <div class="col-xs-12 col-md-4">
                <q-chip
                    v-for="filterItem in filters"
                    :key="filterItem.name"
                    :label="getFilterLabel(filterItem)"
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
    name: 'CscSearchFilters',
    props: {
        filterOptions: {
            type: Array,
            required: true
        },
        dataCyPrefix: {
            type: String,
            default: 'csc-pbx'
        }
    },
    emits: ['filter'],
    data () {
        return {
            filterType: this.filterOptions[0]?.value ?? null,
            typedFilter: null,
            filters: []
        }
    },
    methods: {
        triggerFilter () {
            this.addFilter(this.filterType, this.typedFilter)
        },
        removeFilter (name) {
            this.filters = this.filters.filter((i) => i.name !== name)
            this.emitFilter()
        },
        removeFilters () {
            if (this.filters.length > 0) {
                this.filters = []; this.emitFilter()
            }
        },
        addFilter (name, value) {
            const v = value?.trim()
            if (v) {
                this.typedFilter = null
                this.filters = this.filters.filter((i) => i.name !== name)
                this.filters.push({ name, value: v })
                this.emitFilter()
            }
        },
        emitFilter () {
            const params = {}
            this.filters.forEach((f) => {
                params[f.name] = f.value
            })
            this.$emit('filter', params)
        },
        getFilterLabel (filterItem) {
            const option = this.filterOptions.find((o) => o.value === filterItem.name)
            return `${option?.label ?? this.$t('Unknown')}: ${filterItem.value}`
        }
    }
}
</script>
