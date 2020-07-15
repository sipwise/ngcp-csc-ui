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
            <q-popover
                ref="day"
                @open="showQDate()"
                class="csc-cf-calendar-day"
            >
                <q-datetime
                    ref="dayWidget"
                    no-clear
                    class="csc-cf-day-widget"
                    v-model="dayModel"
                    :min="today"
                    />
            </q-popover>
        </div>
    </div>
</template>

<script>
    import {
        mapGetters,
    } from 'vuex'
    import CscSpinner from '../../CscSpinner'
    import {
        QDatetime,
        QPopover,
        date
    } from 'quasar-framework'

    export default {
        name: 'csc-new-call-forward-condition-type-select',
        props: [
            'groupId',
            'groupName',
            'disableSourcesetMenu',
            'disableTimesetMenu'
        ],
        components: {
            CscSpinner,
            QDatetime,
            QPopover
        },
        data () {
            return {
                enabled: true,
                action: null,
                timesetName: null,
                day: null,
                today: new Date()
            }
        },
        mounted(){
            this.timesetName = 'timeset-'+this.groupId;
        },
        computed: {
            ...mapGetters('newCallForward', []),
            dayModel: {
                get() {
                    return this.day;
                },
                async set(value) {
                    try{
                        this.$store.dispatch('newCallForward/addGroupLoader', this.groupId);
                        const timeSetId = await this.$store.dispatch('newCallForward/createTimeSet', this.timesetName);
                        this.day = {
                            "year": date.formatDate(value, 'YYYY'),
                            "month": date.formatDate(value, 'M'),
                            "mday": date.formatDate(value, 'D')
                        }
                        this.$store.dispatch('newCallForward/addTimesetToGroup', {
                            name: this.groupName,
                            groupId: this.groupId,
                            timeSetId: timeSetId
                        });
                        await this.$store.dispatch('newCallForward/addTimeToTimeset', {
                            id: timeSetId,
                            time: this.day
                        });
                        await this.$store.dispatch('newCallForward/loadTimesets');
                        this.$store.dispatch('newCallForward/removeGroupLoader', this.groupId);

                    }
                    catch(err){
                        console.log(err)
                    }

                }
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
        margin-top -100px !important
    .q-datetime-weekdays
        color $tertiary
    .q-datetime-days div:not(.q-datetime-day-active),
    .q-datetime-dark
        color $white
</style>
