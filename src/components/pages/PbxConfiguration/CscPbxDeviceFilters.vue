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
                />
            </div>
            <div
                class="col-xs-12 col-md-2"
            >
                <q-input
                    v-if="!filterTypeModel || filterTypeModel.control === 'input'"
                    v-model="typedFilter"
                    type="text"
                    dense
                    :disable="loading || filterType === null"
                    :label="(filterType === null) ? $t('Type something') : filterTypeModel.label"
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
                            @click="triggerFilter"
                        />
                    </template>
                </q-input>
                <csc-pbx-model-select
                    v-if="filterType === 'profile_id'"
                    v-model="typedFilter"
                    :profiles="deviceProfileList"
                    :profile-map="deviceProfileMap"
                    :disable="loading || filterType === null"
                    dense
                    @opened="$emit('model-select-opened')"
                    @input="triggerFilter"
                />
                <csc-pbx-auto-attendant-selection
                    v-if="filterType === 'display_name'"
                    v-model="typedFilter"
                    use-input
                    dense
                    :show-selected-item-icon="false"
                    :options="subscribersOptionsFiltered"
                    :disable="loading"
                    @filter="filterSubscriberOptions"
                    @update:model-value="triggerFilter"
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
import CscPbxModelSelect from '../PbxConfiguration/CscPbxModelSelect'
import CscPbxAutoAttendantSelection from './CscPbxAutoAttendantSelection'
import { mapActions, mapState } from 'vuex'

export default {
    name: 'CscPbxDeviceFilters',
    components: {
        CscPbxModelSelect,
        CscPbxAutoAttendantSelection
    },
    props: {
        loading: {
            type: Boolean,
            default: false
        }
    },
    emits: ['model-select-opened', 'filter'],
    data () {
        return {
            filterTypeModel: null,
            typedFilter: null,
            filters: [],
            subscribersFilter: ''
        }
    },
    computed: {
        ...mapState('pbx', [
            'deviceProfileMap',
            'deviceProfileList',
            'subscriberList'
        ]),
        subscribersOptions () {
            const options = []
            this.subscriberList.forEach((subscriber) => {
                let icon = 'person'
                let subscriberTypeTitle = this.$t('Seat')
                if (subscriber.is_pbx_group) {
                    icon = 'group'
                    subscriberTypeTitle = this.$t('Group')
                } else if (subscriber.is_pbx_pilot) {
                    icon = 'person_outline'
                    subscriberTypeTitle = this.$t('Pilot')
                }
                options.push({
                    label: subscriber.display_name || subscriber.webusername,
                    icon: icon,
                    value: subscriber.display_name,
                    disable: !subscriber.display_name,
                    subscriberTypeTitle
                })
            })
            return options
        },
        subscribersOptionsFiltered () {
            return this.subscribersOptions.filter(option => option.label.toLowerCase().indexOf(this.subscribersFilter) > -1)
        },
        filterType () {
            return this.filterTypeModel && this.filterTypeModel.value
        },
        filterTypeOptions () {
            return [
                {
                    label: this.$t('Station name'),
                    value: 'station_name',
                    control: 'input'
                },
                {
                    label: this.$t('MAC address'),
                    value: 'identifier',
                    control: 'input'
                },
                {
                    label: this.$t('Phone model'),
                    value: 'profile_id',
                    control: 'select'
                },
                {
                    label: this.$t('Extension'),
                    value: 'pbx_extension',
                    control: 'input'
                },
                {
                    label: this.$t('Group/Seat/Pilot'),
                    value: 'display_name',
                    control: 'select'
                }
            ]
        },
        filtersList () {
            return this.filters.map((filterItem) => {
                let filterDisplayValue = filterItem.value
                if (filterItem.id === 'profile_id') {
                    filterDisplayValue = this.deviceProfileMap[filterItem.value].name
                }
                return {
                    id: filterItem.id,
                    filterInfo: filterItem.title + ': ' + filterDisplayValue
                }
            })
        }
    },
    watch: {
        filterTypeModel () {
            this.typedFilter = null
        }
    },
    mounted () {
        this.loadSubscribers()
    },
    methods: {
        ...mapActions('pbx', [
            'loadSubscribers'
        ]),
        filterSubscriberOptions (val, update, abort) {
            update(() => {
                this.subscribersFilter = val.toLowerCase()
            })
        },
        triggerFilter (data) {
            const filterId = this.filterTypeModel?.value
            let filterTitle = this.filterTypeOptions.find(option => option.value === filterId).label
            let filterValue = this.typedFilter

            if (this.filterType === 'display_name') {
                filterTitle = data.subscriberTypeTitle
                filterValue = data.value
            }
            this.addFilter(filterId, filterTitle, filterValue)
        },
        removeFilter (id) {
            this.filters = this.filters.filter(item => item.id !== id)
            this.filter()
        },
        removeFilters () {
            if (this.filters.length > 0) {
                this.filters = []
                this.filter()
            }
        },
        addFilter (id, title, value) {
            const valueTrimmed = _.trim(value)
            if (valueTrimmed) {
                this.typedFilter = null
                this.filters = this.filters.filter(item => item.id !== id)
                const filter = {
                    id,
                    title,
                    value: valueTrimmed
                }
                this.filters.push(filter)
                this.filter()
            }
        },
        filter () {
            const params = {}
            this.filters.forEach(filter => {
                params[filter.id] = filter.value
            })

            // a special fix because of q-select behaviour. it stores 0 for empty selection
            if (!params.profile_id) {
                delete params.profile_id
            }

            this.$emit('filter', params)
        }
    }
}
</script>
