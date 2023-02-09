<template>
    <q-item
        :disable="loading || (mapping && !mapping.enabled)"
    >
        <q-item-section
            side
        >
            <q-icon
                name="subdirectory_arrow_right"
            />
        </q-item-section>
        <q-item-section>
            <q-item-label>
                {{ $t('Ring at') }}
                <span
                    class="q-pl-sm text-weight-bold"
                >
                    <q-icon
                        name="ring_volume"
                    />
                    {{ getPrimaryNumber }}
                </span>
            </q-item-label>
        </q-item-section>
        <q-inner-loading
            :showing="$wait.is(waitIdentifier)"
            color="primary"
            class="bg-main-menu"
        >
            <csc-spinner />
        </q-inner-loading>
    </q-item>
</template>

<script>
import {
    mapGetters,
    mapState
} from 'vuex'
import CscSpinner from 'components/CscSpinner'
import numberFilter from '../../filters/number'
export default {
    name: 'CscCfGroupItemPrimaryNumber',
    components: { CscSpinner },
    props: {
        mapping: {
            type: Object,
            default: undefined
        },
        destinationSet: {
            type: Object,
            default: undefined
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
        }
    },
    data () {
        return {
        }
    },
    computed: {
        ...mapState('pbxSeats', [
            'seatSelected'
        ]),
        ...mapGetters('user', [
            'primaryNumber'
        ]),
        waitIdentifier () {
            return 'csc'
        },
        getPrimaryNumber () {
            const resultNumber = (this.seatSelected) ? numberFilter(this.seatSelected.primary_number) : numberFilter(this.primaryNumber)
            return resultNumber
        }
    }
}
</script>
