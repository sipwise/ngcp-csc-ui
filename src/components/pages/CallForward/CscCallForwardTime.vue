<template>
    <q-item>
        <q-item-section>
            {{ time.weekday | weekday }}, {{ time.from }} - {{ time.to }}
        </q-item-section>
        <q-item-section
            side
            top
        >
            <csc-more-menu>
                <csc-popup-menu-item
                    color="negative"
                    icon="delete"
                    :label="$t('Remove')"
                    @click="deleteTime"
                />
            </csc-more-menu>
        </q-item-section>
    </q-item>
</template>

<script>
import {
    mapGetters
} from 'vuex'
import CscMoreMenu from 'components/CscMoreMenu'
import CscPopupMenuItem from 'components/CscPopupMenuItem'

export default {
    name: 'CscCallForwardTime',
    components: { CscPopupMenuItem, CscMoreMenu },
    props: {
        time: {
            type: Object,
            default: null
        }
    },
    data () {
        return {
        }
    },
    computed: {
        ...mapGetters('callForward', {
            timesLength: 'getTimesetTimesLength'
        })
    },
    methods: {
        deleteTime () {
            this.$emit('delete-time')
        }
    }
}
</script>
