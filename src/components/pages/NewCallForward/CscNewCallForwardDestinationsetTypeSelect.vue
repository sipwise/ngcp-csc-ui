<template>
    <div>
        <div
            class="csc-cf-dest-type"
            @click="addDestinationsetUnconditional()"
        >
            {{ $t('If available') }}
        </div>
        <div
            class="csc-cf-dest-type"
            @click="addDestinationsetOffline()"
        >
            {{ $t('If not available') }}
        </div>
        <div
            class="csc-cf-dest-type"
            @click="addDestinationsetBusy()"
        >
            {{ $t('If busy') }}
        </div>
    </div>
</template>

<script>
import {
    mapGetters
} from 'vuex'
export default {
    name: 'CscNewCallForwardDestinationsetTypeSelect',
    computed: {
        ...mapGetters('newCallForward', [
            'timeoutGroupExists',
            'timeoutFromGroupExists',
            'unconditionalGroupExists',
            'unconditionalFromGroupExists',
            'offlineGroupExists',
            'busyGroupExists'
        ])
    },
    methods: {
        async addDestinationsetUnconditional () {
            await this.$store.dispatch('newCallForward/setSelectedDestType', 'unconditional')
        },
        async addDestinationsetUnconditionalFrom () {
            await this.$store.dispatch('newCallForward/setSelectedDestType', 'unconditional-from')
        },
        async addDestinationsetOffline () {
            await this.$store.dispatch('newCallForward/setSelectedDestType', 'offline')
        },
        async addDestinationsetBusy () {
            await this.$store.dispatch('newCallForward/setSelectedDestType', 'busy')
        },
        cancel () {
            this.close()
        },
        close () {
            this.$emit('close')
        }
    }
}
</script>

<style lang="stylus" rel="stylesheet/stylus">
    .csc-cf-dest-type
        min-width 100px
        padding 10px
        cursor pointer
    .csc-cf-dest-type:hover
        background $main-menu-item-hover-background
</style>
