<template>
    <div
        v-if="enabled"
    >
        <div
            class="csc-cf-dest-type"
            @click="addFromCondition()"
        >
            {{ $t('pages.newCallForward.fromLabel') }}
        </div>
        <div
            class="csc-cf-dest-type"
            @click="addDateIsCondition()"
        >
            {{ $t('pages.newCallForward.dateIsLabel') }}
        </div>
    </div>
</template>

<script>
    import {
        mapGetters,
    } from 'vuex'
    import CscSpinner from '../../CscSpinner'
    import { } from 'quasar-framework'

    export default {
        name: 'csc-new-call-forward-condition-type-select',
        components: {
            CscSpinner
        },
        data () {
            return {
                enabled: true,
                action: null
            }
        },
        computed: {
            ...mapGetters('newCallForward', [
            ])
        },
        methods: {
            addFromCondition(){
                this.action = "addFromCondition";
                this.$parent.close()
            },
            addDateIsCondition(){
                this.action = "addDateIsCondition";
                this.$parent.close()
            },
            cancel() {
                this.action = null;
                this.enabled = false;
            },
            add() {
                this.enabled = true;
            },
            close() {
                this.action = null;
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
