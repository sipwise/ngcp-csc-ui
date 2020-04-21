<template>
    <div
        v-if="enabled"
    >
        <div
            class="csc-cf-dest-type"
            @click="showNumberForm()"
        >
            {{ $t('pages.newCallForward.numberLabel') }}
        </div>
        <div
            class="csc-cf-dest-type"
            @click="addVoiceMail()"
        >
            {{ $t('pages.newCallForward.voiceMailLabel') }}
        </div>
        <div
            class="csc-cf-dest-type"
            @click="addConference()"
        >
            {{ $t('pages.newCallForward.conferenceLabel') }}
        </div>
    </div>
</template>

<script>
    import CscSpinner from '../../CscSpinner'
    import { } from 'quasar-framework'

    export default {
        name: 'csc-new-call-forward-destination-type-form',
        components: {
            CscSpinner
        },
        data () {
            return {
                enabled: false,
                action: null
            }
        },
        props: [],
        computed: {},
        methods: {
            showNumberForm(){
                this.action = 'destination';
                this.$parent.close()
            },
            addVoiceMail(){
                this.action = 'voicemail';
                this.$parent.close()
            },
            addConference(){
                this.action = 'conference';
                this.$parent.close()
            },
            cancel() {
                this.enabled = false;
            },
            add() {
                this.enabled = true;
            },
            close() {
                this.enabled = false;
            },
        }
    }
</script>

<style lang="stylus" rel="stylesheet/stylus">
    @import '../../../themes/app.common.styl'
    .csc-cf-dest-type
        min-width 100px
        padding 10px
        cursor pointer
    .csc-cf-dest-type:hover
        background $main-menu-item-hover-background
</style>
