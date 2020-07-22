<template>
    <div
        v-if="enabled"
    >
        <div
            class="csc-cf-dest-type"
            v-if="disableSourcesetMenu"
            @click="addFromCondition()"
        >
            {{ $t('pages.newCallForward.fromLabel') }}
        </div>
        <div
            class="csc-cf-dest-type"
            v-if="disableTimesetMenu"
            @click="addDateIsCondition()"
        >
            {{ $t('pages.newCallForward.dateIsLabel') }}
        </div>
        <div
            class="csc-cf-dest-type"
            ref="daterangeItem"
            v-if="disableDateRangeMenu"
            @click="addDateRangeCondition()"
        >
            {{ $t('pages.newCallForward.dateRangeLabel') }}

        </div>
        <div
            class="csc-cf-dest-type"
            v-if="disableWeekdaysMenu"
            @click="addWeekdayCondition()"
        >
            {{ $t('pages.newCallForward.weekdaysLabel') }}
        </div>
    </div>
</template>

<script>
    import {
        mapGetters,
    } from 'vuex'
    import CscSpinner from '../../CscSpinner'
    import {
        QPopover,
        QField,
        QBtn
    } from 'quasar-framework'

    export default {
        name: 'csc-new-call-forward-condition-type-select',
        props: [
            'groupId',
            'groupName',
            'disableSourcesetMenu',
            'disableTimesetMenu',
            'disableDateRangeMenu',
            'disableWeekdaysMenu'
        ],
        components: {
            CscSpinner,
            QPopover,
            QField,
            QBtn
        },
        data () {
            return {
                enabled: true,
                action: null,
                timesetName: null
            }
        },
        mounted(){
            this.timesetName = 'timeset-'+this.groupId;
        },
        computed: {
            ...mapGetters('newCallForward', []),
            allFieldsFilled(){
                return this.rangeDateModel.from !== null &&
                       this.rangeDateModel.to !== null &&
                       this.rangeTimeModel.from !== null &&
                       this.rangeTimeModel.to !== null;
            }
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
            addDateRangeCondition(){
                this.action = "addDateRangeCondition";
                this.$parent.close();
            },
            addWeekdayCondition(){
                this.action = "addWeekdayCondition";
                this.$parent.close()
            },
            cancel() {
                this.action = null;
                this.enabled = false;
                this.$parent.close();
            },
            add() {
                this.enabled = true;
            },
            close() {
                this.action = null;
                this.enabled = false;
                this.$parent.close();
            },
            showQDate(){
                this.$refs.dayWidget.open()
            }
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
    .csc-cf-calendar-day
        padding 20px
        min-width 400px
    .q-datetime-weekdays
        color $tertiary
</style>
