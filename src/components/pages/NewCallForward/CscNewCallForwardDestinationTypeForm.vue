<template>
    <div>
        <div
            class="csc-cf-dest-type"
            @click="setSelectedDestinationType('destination')"
        >
            {{ $t('Number') }}
        </div>
        <div
            class="csc-cf-dest-type"
            @click="setSelectedDestinationType('voicemail')"
        >
            {{ $t('Voicemail') }}
        </div>
    </div>
</template>

<script>
import {
    mapActions
} from 'vuex'
export default {
    name: 'CscNewCallForwardDestinationTypeForm',
    mounted () {
        this.setSelectedDestinationType(null)
    },
    methods: {
        ...mapActions('newCallForward', [
            'setSelectedDestinationType'
        ]),
        cancel () {
            this.close = false
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
