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
                    data-cy="csc-cdr-filter"
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
                    :label="$t('From')"
                    data-cy="csc-cdr-filter-from"
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
                                    mask="YYYY-MM-DD"
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
                </q-input>
                <q-input
                    v-model="dateEndFilter"
                    class="col-6"
                    dense
                    :disable="loading || filterType === null"
                    :label="$t('To')"
                    data-cy="csc-cdr-filter-to"
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
                                    mask="YYYY-MM-DD"
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
                </q-input>
            </div>
            <div
                v-else-if="false"
                class="row col-xs-12 col-md-3"
            >
                <q-select
                    v-model="filterDirection"
                    class="full-width"
                    dense
                    :options="filterDirectionOptions"
                    :label="$t('In/Out')"
                    data-cy="csc-cdr-filter"
                    :disable="loading"
                    @update:model-value="triggerDirectionFilter"
                />
            </div>
            <div
                v-else-if="filterType === 'type'"
                class="row col-xs-12 col-md-3"
            >
                <q-select
                    v-model="filterTypeField"
                    class="full-width"
                    dense
                    :options="filterTypeFieldOptions"
                    :label="$t('Type')"
                    data-cy="csc-cdr-filter"
                    :disable="loading"
                    @update:model-value="triggerTypeFieldFilter"
                />
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
    name: 'CscCdrFilters',
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
            filterDirection: null,
            filterTypeField: null,
            dateStartFilter: null,
            dateEndFilter: null,
            filters: []
        }
    },
    computed: {
        ...mapGetters([
            'getCurrentFormattedDateWithDash'
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
                /* {
                    label: this.$t('Direction'),
                    value: 'direction'
                }, */
                {
                    label: this.$t('Type'),
                    value: 'type'
                }
            ]
        },
        filterDirectionOptions () {
            return [
                {
                    label: this.$t('In'),
                    value: 'in'
                },
                {
                    label: this.$t('Out'),
                    value: 'out'
                }
            ]
        },
        filterTypeFieldOptions () {
            return [
                {
                    label: this.$t('Call'),
                    value: 'call'
                },
                {
                    label: this.$t('Voicemail'),
                    value: 'voicemail'
                },
                {
                    label: this.$t('Sms'),
                    value: 'sms'
                },
                {
                    label: this.$t('Fax'),
                    value: 'fax'
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
                    filterName = this.filterTypeOptions.find((option) => option.value === filterItem.name).label
                }
                return {
                    id: filterItem.name,
                    filterInfo: `${filterName}: ${filterDisplayValue}`
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
        triggerDirectionFilter () {
            this.addFilter(this.filterTypeModel?.value, this.filterDirection.value)
        },
        triggerTypeFieldFilter () {
            this.addFilter(this.filterTypeModel?.value, this.filterTypeField.value)
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
                this.resetFilters()
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
        resetFilters () {
            this.typedFilter = null
            this.dateStartFilter = null
            this.dateEndFilter = null
            this.filterDirection = null
            this.filterTypeField = null
        },
        loadFormattedDateStart () {
            const currentDate = this.getCurrentFormattedDateWithDash
            if (!this.dateStartFilter) {
                this.dateStartFilter = currentDate
            }
        },
        loadFormattedDateEnd () {
            const currentDate = this.getCurrentFormattedDateWithDash
            if (!this.dateEndFilter) {
                this.dateEndFilter = currentDate
            }
        }
    }
}
</script>
