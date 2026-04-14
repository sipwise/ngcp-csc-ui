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
                <template
                    v-if="showTimeoutInfo"
                >
                    {{ ' ' + $t('for') + ' ' }}
                    <span
                        class="q-pl-xs q-pr-xs text-primary text-weight-bold cursor-pointer"
                        style="white-space: nowrap"
                    >
                        <q-icon
                            name="access_time"
                        />
                        {{ ringTimeout }}
                        {{ $t('seconds') }}
                        <q-tooltip class="text-dark">{{ $t('This setting is synced with "After Ring Timeout", which can be edited above.') }}</q-tooltip>
                    </span>
                </template>
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
import CscSpinner from 'components/CscSpinner'
import numberFilter from 'src/filters/number'
import { mapGetters } from 'vuex'
export default {
    name: 'CscCfGroupItemPrimaryNumber',
    components: { CscSpinner },
    props: {
        mapping: {
            type: Object,
            default: undefined
        },
        loading: {
            type: Boolean,
            default: false
        },
        primaryNumberSource: {
            type: Object,
            default: undefined
        },
        showTimeoutInfo: {
            type: Boolean,
            default: true
        }
    },
    data () {
        return {
        }
    },
    computed: {
        ...mapGetters('callForwarding', [
            'ringTimeout'
        ]),
        ...mapGetters('user', [
            'primaryNumber'
        ]),
        waitIdentifier () {
            return 'csc'
        },
        getPrimaryNumber () {
            const resultNumber = (this.primaryNumberSource) ? numberFilter(this.primaryNumberSource.primary_number) : numberFilter(this.primaryNumber)
            return resultNumber
        }
    }
}
</script>
