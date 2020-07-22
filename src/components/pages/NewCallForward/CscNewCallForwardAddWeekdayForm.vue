<template>
    <div
        v-if="enabled"
        class="csc-form"
        v-bind:class="{ 'csc-cf-popover-hide': toggleFormVisibility}"
    >
        <div
            class="csc-cf-delete-weekdays-btn"
        >
            <csc-confirm-dialog
                ref="confirmDeleteTimesetDialog"
                title-icon="delete"
                :title="$t('pages.newCallForward.cancelTimesetDialogTitle', {name: 'weekdays'})"
                :message="$t('pages.newCallForward.cancelTimesetText', {name: 'this'})"
                @confirm="deleteTimeset"
            />
        </div>
        <div
            class="csc-form-actions row justify-center csc-actions-cont"
        >


            <q-btn
                class="day-btn"
                v-bind:class="{ 'day-selected-btn': weekdays.includes('2')}"
                rounded
                @click="toggleWeekday('2')"
            >
                M
            </q-btn>
            <q-btn
                class="day-btn"
                v-bind:class="{ 'day-selected-btn': weekdays.includes('3')}"
                rounded
                @click="toggleWeekday('3')"
            >
                T
            </q-btn>
            <q-btn
                class="day-btn"
                v-bind:class="{ 'day-selected-btn': weekdays.includes('4')}"
                rounded
                @click="toggleWeekday('4')"
            >
                W
            </q-btn>
            <q-btn
                class="day-btn"
                v-bind:class="{ 'day-selected-btn': weekdays.includes('5')}"
                rounded
                @click="toggleWeekday('5')"
            >
                T
            </q-btn>
            <q-btn
                class="day-btn"
                v-bind:class="{ 'day-selected-btn': weekdays.includes('6')}"
                rounded
                @click="toggleWeekday('6')"
            >
                F
            </q-btn>
            <q-btn
                class="day-btn"
                v-bind:class="{ 'day-selected-btn': weekdays.includes('7')}"
                rounded
                @click="toggleWeekday('7')"
            >
                S
            </q-btn>
            <q-btn
                class="day-btn"
                v-bind:class="{ 'day-selected-btn': weekdays.includes('1')}"
                rounded
                @click="toggleWeekday('1')"
            >
                S
            </q-btn>

        </div>
        <div
            class="csc-form-actions row justify-center csc-actions-cont"
        >
            <q-btn
                :disabled="this.weekdays.length < 1"
                flat
                color="red"
                icon="delete"
                @mousedown.native="showRemoveDialog()"
            >
                {{ $t('buttons.remove') }}
            </q-btn>
            <q-btn
                flat
                color="default"
                icon="clear"
                @mousedown.native="cancel()"
            >
                {{ $t('buttons.cancel') }}
            </q-btn>
            <q-btn
                v-if="!loading"
                flat
                color="primary"
                icon="done"
                @click="save(); close()"
            >
                {{ $t('buttons.save') }}
            </q-btn>
            <div
                v-if="loading"
                class="csc-form-actions-spinner"
            >
                <csc-spinner />
            </div>
        </div>
    </div>
</template>

<script>
    import CscNewCallForwardInput from './CscNewCallForwardInput'
    import CscNewCallForwardInputText from './CscNewCallForwardInputText'
    import CscConfirmDialog from "../../CscConfirmationDialog";
    import CscSpinner from '../../CscSpinner'
    import {
        QField,
        QInput,
        QBtn
    } from 'quasar-framework'

    export default {
        name: 'csc-new-call-forward-add-weekday-form',
        components: {
            CscNewCallForwardInput,
            CscNewCallForwardInputText,
            CscConfirmDialog,
            CscSpinner,
            QField,
            QInput,
            QBtn
        },
        data () {
            return {
                timesetId: null,
                timesetName: null,
                toggleFormVisibility: false,
                loading: false,
                enabled: false,
                weekdays: []
            }
        },
        props: [
            'groupName',
            'groupId',
            'id',
            'days'
        ],
        computed: {
            saveDisabled() {
                return true;
            }
        },
        mounted(){
            this.timesetName = 'timeset-'+this.groupId;
            this.timeSetId = this.id;
            if(this.days){
                for(let day of this.days){
                    this.weekdays.push(day.wday);
                }
            }

        },
        methods: {
            async save() {
                const forwardGroupId = this.groupId;
                this.$store.dispatch('newCallForward/addGroupLoader', forwardGroupId);
                try{
                    if(this.weekdays.length < 1){
                        this.deleteTimeset();
                    }
                    else{
                        if(this.id){
                            this.timeSetId = this.id
                        }
                        else{
                            this.timeSetId = await this.$store.dispatch('newCallForward/createTimeSet', this.timesetName);
                        }

                        this.$store.dispatch('newCallForward/addTimesetToGroup', {
                            name: this.groupName,
                            groupId: this.groupId,
                            timeSetId: this.timeSetId
                        });
                        this.weekdays.sort((a,b) => (parseInt(a) > parseInt(b)) ? 1 : ((parseInt(b) > parseInt(a)) ? -1 : 0));
                        const days = this.weekdays.map(item => { return {"wday":item}});
                        const updatedTimeset = await this.$store.dispatch('newCallForward/addTimeToTimeset', {
                            id: this.timeSetId,
                            time: days
                        });
                        this.$store.dispatch('newCallForward/setTimeset', updatedTimeset);
                    }
                }
                catch(err){
                    console.log(err)
                }
                this.$store.dispatch('newCallForward/removeGroupLoader', forwardGroupId);
            },
            cancel(){
                this.weekdays = [];
                if(this.days){
                    for(let day of this.days){
                        this.weekdays.push(day.wday);
                    }
                }
                this.close();
            },
            close() {
                this.$parent.close();
                this.enabled = false;
            },
            add() {
                this.toggleFormVisibility = false;
                this.enabled = true;
            },
            showRemoveDialog(){
                this.toggleFormVisibility = true;
                this.$refs.confirmDeleteTimesetDialog.open();
            },
            toggleWeekday(weekday){
                if(this.weekdays.includes(weekday)){
                    this.weekdays = this.weekdays.filter(item => item !== weekday);
                }
                else{
                    this.weekdays.push(weekday);
                }
            },
            async deleteTimeset(){
                this.$store.dispatch('newCallForward/addGroupLoader', this.groupId);
                await this.$store.dispatch('newCallForward/deleteTimeset', this.timeSetId);
                this.$store.dispatch('newCallForward/loadMappings');
                this.$store.dispatch('newCallForward/removeGroupLoader', this.groupId);
            }
        }
    }
</script>

<style lang="stylus" rel="stylesheet/stylus">
    @import '../../../themes/app.common.styl'
    .csc-actions-cont
        margin-bottom 15px
        .day-btn
            margin 5px
            background rgba(37,51,85,0.8)
            width 35px
        .day-selected-btn
            background $primary
    .csc-cf-delete-weekdays-btn
        float right
        margin-top -10px
        margin-right -20px
</style>