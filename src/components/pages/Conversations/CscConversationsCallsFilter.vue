<template>
    <q-toolbar>
        <q-space />
        <div
            class="col-xs-12 col-md-4"
        >
            <q-select
                v-model="filterTypeModel"
                dense
                :options="filterTypeOptions"
                :label="$t('Filter by')"
                :disable="loading"
            />
        </div>
        <q-space />
    </q-toolbar>
</template>

<script>
export default {
    name: 'CscConversationsCallsFilter',
    props: {
        loading: {
            type: Boolean,
            default: false
        }
    },
    emits: ['filter'],
    data () {
        return {
            filterTypeModel: null
        }
    },
    computed: {
        filterType () {
            return this.filterTypeModel && this.filterTypeModel.value
        },
        filterTypeOptions () {
            return [
                {
                    label: this.$t('Show all calls'),
                    value: 'AllCalls'
                },
                {
                    label: this.$t('Show outgoing calls only'),
                    value: 'outgoingCallsOnly'
                },
                {
                    label: this.$t('Show incoming calls only'),
                    value: 'incomingCallsOnly'
                }
            ]
        }
    },
    watch: {
        filterTypeModel () {
            this.filter()
        }
    },
    methods: {
        filter () {
            const params = {}
            if (this.filterType === 'incomingCallsOnly') {
                params.direction = 'in'
            } else if (this.filterType === 'outgoingCallsOnly') {
                params.direction = 'out'
            }
            this.$emit('filter', params)
        }
    }
}
</script>
