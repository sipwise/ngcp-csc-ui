<template>
    <div>
        <div
            class="row justify-center full-width q-gutter-x-sm"
        >
            <div
                class="col-xs-12 col-md-2"
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
                v-if="filterType === 'timerange'"
                class="row col-xs-12 col-md-4"
            >
                <q-input
                    v-model="dateStartFilter"
                    class="q-pr-sm col-6"
                    dense
                    :disable="loading || filterType === null"
                    :label="$t('Start time')"
                >
                    <template v-slot:prepend>
                        <q-icon
                            name="event"
                            class="cursor-pointer"
                        >
                            <q-popup-proxy
                                transition-show="scale"
                                transition-hide="scale"
                                @hide="addFilter('startTime', dateStartFilter)"
                            >
                                <q-date
                                    v-model="dateStartFilter"
                                    mask="YYYY-MM-DD HH:mm"
                                    format24h
                                >
                                    <div class="row items-center justify-end">
                                        <q-btn
                                            v-close-popup
                                            :label="$t('Close')"
                                            color="primary"
                                            flat
                                        />
                                    </div>
                                </q-date>
                            </q-popup-proxy>
                        </q-icon>
                    </template>

                    <template v-slot:append>
                        <q-icon
                            name="access_time"
                            class="cursor-pointer"
                        >
                            <q-popup-proxy
                                transition-show="scale"
                                transition-hide="scale"
                                @hide="addFilter('startTime', dateStartFilter)"
                            >
                                <q-time
                                    v-model="dateStartFilter"
                                    mask="YYYY-MM-DD HH:mm"
                                    format24h
                                >
                                    <div class="row items-center justify-end">
                                        <q-btn
                                            v-close-popup
                                            :label="$t('Close')"
                                            color="primary"
                                            flat
                                        />
                                    </div>
                                </q-time>
                            </q-popup-proxy>
                        </q-icon>
                    </template>
                </q-input>
                <q-input
                    v-model="dateEndFilter"
                    class="col-6"
                    dense
                    :disable="loading || filterType === null"
                    :label="$t('End time')"
                    @input="triggerFilter"
                >
                    <template v-slot:prepend>
                        <q-icon
                            name="event"
                            class="cursor-pointer"
                        >
                            <q-popup-proxy
                                transition-show="scale"
                                transition-hide="scale"
                                @hide="addFilter('endTime', dateEndFilter)"
                            >
                                <q-date
                                    v-model="dateEndFilter"
                                    mask="YYYY-MM-DD HH:mm"
                                >
                                    <div class="row items-center justify-end">
                                        <q-btn
                                            v-close-popup
                                            :label="$t('Close')"
                                            color="primary"
                                            flat
                                        />
                                    </div>
                                </q-date>
                            </q-popup-proxy>
                        </q-icon>
                    </template>

                    <template v-slot:append>
                        <q-icon
                            name="access_time"
                            class="cursor-pointer"
                        >
                            <q-popup-proxy
                                transition-show="scale"
                                transition-hide="scale"
                                @hide="addFilter('endTime', dateEndFilter)"
                            >
                                <q-time
                                    v-model="dateEndFilter"
                                    mask="YYYY-MM-DD HH:mm"
                                    format24h
                                >
                                    <div class="row items-center justify-end">
                                        <q-btn
                                            v-close-popup
                                            :label="$t('Close')"
                                            color="primary"
                                            flat
                                        />
                                    </div>
                                </q-time>
                            </q-popup-proxy>
                        </q-icon>
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
    name: 'CscCallRecordingFilters',
    props: {
        loading: {
            type: Boolean,
            default: false
        }
    },
    data () {
        return {
            filterTypeModel: null,
            typedFilter: null,
            dateStartFilter: null,
            dateEndFilter: null,
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
                    label: this.$t('Timerange'),
                    value: 'timerange'
                }
            ]
        },
        filtersList () {
            return this.filters.map((filterItem) => {
                const filterDisplayValue = filterItem.value
                let filterName
                switch (filterItem.name) {
                case 'startTime':
                    filterName = this.$t('Start time')
                    break
                case 'endTime' :
                    filterName = this.$t('End time')
                    break
                default:
                    filterName = this.filterTypeOptions.find(option => option.value === filterItem.name).label
                }
                return {
                    id: filterItem.name,
                    filterInfo: filterName + ': ' + filterDisplayValue
                }
            })
        }
    },
    watch: {
        filterTypeModel () {
            this.resetFilters()
        }
    },
    methods: {
        triggerFilter (data) {
            this.addFilter(this.filterTypeModel?.value, this.typedFilter)
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
                this.resetFilters()
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
        },
        resetFilters () {
            this.typedFilter = null
            this.dateStartFilter = null
            this.dateEndFilter = null
        }
    }
}
</script>
