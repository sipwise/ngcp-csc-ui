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
                    data-cy="csc-recording-filter"
                    :disable="loading"
                />
            </div>
            <div
                v-if="filterType === 'timerange'"
                class="row col-xs-12 col-md-6"
            >
                <q-input
                    v-model="dateStartFilter"
                    class="q-pr-sm col-6"
                    dense
                    :disable="loading || filterType === null"
                    :label="$t('Start time')"
                    data-cy="csc-recording-filter-time-start"
                >
                    <template #prepend>
                        <q-icon
                            name="event"
                            class="cursor-pointer"
                            @click="loadFormattedDateStart()"
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

                    <template #append>
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
                    data-cy="csc-recording-filter-time-end"
                    @input="triggerFilter"
                >
                    <template #prepend>
                        <q-icon
                            name="event"
                            class="cursor-pointer"
                            @click="loadFormattedDateEnd()"
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

                    <template #append>
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
            <div
                v-else-if="filterType !== null"
                class="row col-xs-12 col-md-3"
            >
                <q-input
                    v-model="typedFilter"
                    class="q-pr-sm col-12"
                    dense
                    :disable="loading || filterType === null"
                    :label="(filterType === null) ? $t('Type something') : filterTypeModel.label"
                    data-cy="csc-recording-filter-input"
                    @keypress.enter="triggerFilter"
                    @keydown.space.prevent
                >
                    <template #append>
                        <q-icon
                            name="search"
                            class="cursor-pointer"
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
                    @remove="removeFilter(id)"
                />
            </div>
        </div>
    </div>
</template>

<script>
import _ from 'lodash'
import { mapGetters } from 'vuex'

export default {
    name: 'CscCallRecordingFilters',
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
            dateStartFilter: null,
            dateEndFilter: null,
            filters: []
        }
    },
    computed: {
        ...mapGetters([
            'getCurrentFormattedDateWithDashAndHour'
        ]),
        filterType () {
            return this.filterTypeModel && this.filterTypeModel.value
        },
        filterTypeOptions () {
            return [
                {
                    label: this.$t('Timerange'),
                    value: 'timerange'
                },
                {
                    label: this.$t('Caller'),
                    value: 'caller'
                },
                {
                    label: this.$t('Callee'),
                    value: 'callee'
                },
                {
                    label: this.$t('CallID'),
                    value: 'callId'
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
        },
        loadFormattedDateStart () {
            const currentDate = this.getCurrentFormattedDateWithDashAndHour
            if (!this.dateStartFilter) {
                this.dateStartFilter = currentDate
            }
        },
        loadFormattedDateEnd () {
            const currentDate = this.getCurrentFormattedDateWithDashAndHour
            if (!this.dateEndFilter) {
                this.dateEndFilter = currentDate
            }
        }
    }
}
</script>
