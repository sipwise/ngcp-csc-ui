<template>
    <q-list
        class="relative-position"
        dense
        separator
    >
        <csc-cf-group-title
            ref="cfGroupTitle"
            :loading="loading"
            :mapping="mapping"
            :destination-set="destinationSet"
            :source-set="sourceSet"
            :time-set="timeSet"
            :subscriber-id="subscriberId"
        />
        <template
            v-if="destinationSet"
        >
            <csc-cf-group-item-primary-number
                v-if="mapping.type === 'cft'"
                :loading="loading"
                :mapping="mapping"
                :destination-set="destinationSet"
                :source-set="sourceSet"
                :time-set="timeSet"
            />
            <csc-cf-group-item
                v-for="(destination, destinationIndex) in destinationSet.destinations"
                :key="destinationIndex"
                :loading="loading"
                :destination="destination"
                :destination-previous="(destinationIndex > 0)?destinationSet.destinations[destinationIndex - 1]:null"
                :destination-index="destinationIndex"
                :mapping="mapping"
                :destination-set="destinationSet"
                :source-set="sourceSet"
                :time-set="timeSet"
                @delete-last="$refs.cfGroupTitle.deleteMappingEvent(mapping)"
            />
        </template>
        <q-inner-loading
            :showing="$wait.is(waitIdentifier)"
            color="primary"
            class="bg-main-menu"
        >
            <csc-spinner />
        </q-inner-loading>
    </q-list>
</template>
<script>
import CscCfGroupTitle from 'components/call-forwarding/CscCfGroupTitle'
import CscCfGroupItem from 'components/call-forwarding/CscCfGroupItem'
import CscSpinner from 'components/CscSpinner'
import CscCfGroupItemPrimaryNumber from 'components/call-forwarding/CscCfGroupItemPrimaryNumber'

export default {
    name: 'CscCfGroup',
    components: {
        CscCfGroupItemPrimaryNumber,
        CscSpinner,
        CscCfGroupItem,
        CscCfGroupTitle
    },
    props: {
        mapping: {
            type: Object,
            required: true
        },
        destinationSet: {
            type: Object,
            required: true
        },
        sourceSet: {
            type: Object,
            default: undefined
        },
        timeSet: {
            type: Object,
            default: undefined
        },
        loading: {
            type: Boolean,
            default: false
        },
        subscriberId: {
            type: String,
            default: ''
        }
    },
    computed: {
        waitIdentifier () {
            return 'csc-cf-group-' + this.destinationSet.id
        }
    }
}
</script>
