<template>
    <div
        class="csc-cf-group"
        v-if="group.destinations.length > 0"
    >
        <div
            class="row csc-cf-destination-cont"
        >
                <div
                    class="col col-xs-12 col-md-4 text-right csc-cf-group-title"
                >
                    {{ !(groupsCount < 2 && (group.name.includes('timeout') || group.name.includes('unconditional'))) ? groupTitle :"" }}

                </div>
                <div class="col text-left col-xs-12 col-md-2 csc-cf-dest-number-cont">
                    <q-toggle
                        v-model="isEnabled"
                        @change="toggleGroupChange"
                    />
                </div>
                <div class="col col-xs-12 col-md-5 ">
                    <q-spinner-dots
                        v-if="toggleGroupInProgress || destinationInCreation"
                        class="csc-call-spinner"
                        color="primary"
                        :size="24"
                    />
                </div>
        </div>
        <div
            v-for="(destination, index) in group.destinations"
            :key="genKey()"
        >
            <csc-new-call-forward-destination
                :destination="getDestination(index)"
                :index="index"
                :groupId="group.id"
                :groupName="group.name"
                :allCallsFwd="group.name == 'csc-unconditional' && index === 0"
                :class="{ 'cf-destination-disabled': !isEnabled }"

            />
        </div>
        <div
            class="row csc-cf-destination-cont"
        >
                <div class="col col-xs-12 col-md-4 text-right"></div>
                <div
                    class="col col-xs-12 col-md-2 text-left"
                    v-if="showAddDestBtn"
                    :class="{ 'cf-destination-disabled': !isEnabled }"
                >
                    <div
                        class='csc-cf-destination-add-destination'
                    >
                        <q-icon
                            name="add"
                            color="primary"
                            size="24px"
                        />

                        {{ $t('pages.newCallForward.addDestinationLabel') }}

                    </div>
                    <q-popover
                        ref="destTypeForm"
                        @open="showDestTypeForm()"
                        @close="showNext()"
                        class="csc-cf-group-popover-bottom"
                    >
                        <csc-new-call-forward-destination-type-form
                            ref="selectDestinationType"
                        />
                    </q-popover>
                    <q-popover
                        ref="numberForm"
                        class="csc-cf-number-form csc-cf-group-popover-bottom"
                        v-bind:class="{ 'csc-cf-popover-hide': toggleNumberForm }"
						@open="showNewDestNumber()"
                    >
                        <csc-new-call-forward-add-destination-form
                            ref="addDestinationForm"
                            :groupName="this.group.name"
                            :groupId="this.groupId"
                        />
                    </q-popover>
                </div>
                <div class="col col-xs-12 col-md-6 "></div>
        </div>
    </div>
</template>

<script>
    import {
        mapGetters,
    } from 'vuex'
    import {
        QSpinnerDots,
        QToggle,
        QIcon,
        QPopover,
        QList,
        QItem,
        QItemMain,
        QItemSide
    } from 'quasar-framework'
    import CscObjectSpinner from "../../CscObjectSpinner";
    import CscNewCallForwardDestination from './CscNewCallForwardDestination'
    import CscNewCallForwardAddDestinationForm from './CscNewCallForwardAddDestinationForm'
    import CscNewCallForwardDestinationTypeForm from './CscNewCallForwardDestinationTypeForm'
    export default {
        name: 'csc-cf-group',
        props: [
            'group'
        ],
        components: {
            QSpinnerDots,
            QToggle,
            QIcon,
            QPopover,
            QList,
            QItem,
            QItemMain,
            QItemSide,
            CscObjectSpinner,
            CscNewCallForwardDestination,
            CscNewCallForwardAddDestinationForm,
            CscNewCallForwardDestinationTypeForm
        },
        data () {
            return {
                toggleGroup: true,
                isEnabled: true,
                toggleNumberForm: true,
                toggleGroupInProgress: false
            };
        },
        async mounted(){
            try{
                if(!this.inCreation){
                    const isGroupEnabled =  await this.$store.dispatch('newCallForward/isGroupEnabled', this.group.name);
                    this.isEnabled = isGroupEnabled;
                }

            }
            catch(err){
                console.log(err)
            }
        },
        computed: {
            ...mapGetters('newCallForward', [
                'getOwnPhoneTimeout',
                'destinationInCreation',
                'groupsCount'
            ]),
            showAddDestBtn(){
                const destinations = this.group.destinations;
                for(let dest of destinations){
                    if(dest && (dest.simple_destination && dest.simple_destination.length < 2 || dest.destination.includes('voicebox.local'))){
                        return false;
                    }
                }
                return true;

            },
            groupTitle(){
                let title;
                switch(this.group.name){
                    case "csc-unconditional":
                    case "csc-timeout":
                         title = `${this.$t('pages.newCallForward.titles.timeoutGroup')}`;
                    break;
                    case "csc-offline":
                        title = `${this.$t('pages.newCallForward.titles.offlineGroup')}`;
                    break;
                    case "csc-busy":
                        title = `${this.$t('pages.newCallForward.titles.busyGroup')}`;
                    break;
                }
                return title;
            }
        },
        methods: {
            // we need to generate key because destinations have no id
            genKey(){
                return Math.random();
            },
            showNewDestNumber(){
                this.$refs.addDestinationForm.add();
            },
            async showNext(){
                switch(this.$refs.selectDestinationType.action){
                    case 'destination':
                        this.toggleNumberForm = false;
                        this.$refs.numberForm.open();
                    break;
                    case 'voicemail':
                        await this.$store.dispatch('newCallForward/setDestinationInCreation', true);
                        await this.$store.dispatch('newCallForward/addVoiceMail', this.group.id);
                        await this.$store.dispatch('newCallForward/loadForwardGroups');
                        await this.$store.dispatch('newCallForward/setDestinationInCreation', false);
                    break;
                }
            },
            showDestTypeForm(){
                this.toggleNumberForm = true;
                this.$refs.selectDestinationType.add();
            },
            getDestination(index){
                let destination = {...this.group.destinations[index]}
                if(index === 0){
                    destination.timeout = !isNaN(this.getOwnPhoneTimeout) ? this.getOwnPhoneTimeout : 5;
                }
                else {
                    destination.timeout = this.group.destinations[index-1].timeout;
                }
                return destination;
            },
            async toggleGroupChange(){
                this.toggleGroupInProgress = true;
                await this.$store.dispatch('newCallForward/enableGroup', {
                    groupName: this.group.name,
                    id: this.group.id,
                    enabled: this.isEnabled
                });
                this.toggleGroupInProgress = false;
            }
        }
    }
</script>

<style lang="stylus" rel="stylesheet/stylus">
    @import '../../../themes/app.common.styl'
    .csc-cf-group
        width 100%
    .csc-cf-group-cont
        position relative
    .csc-cf-group-title
        font-weight bold
    .csc-cf-group-title
        text-align right
    .csc-cf-destination-label
        text-align right
    .csc-cf-destination-value
        text-align center
    .csc-cf-destination-add-destination
        padding-left 25px
        width 250px
        white-space nowrap
        overflow hidden
        text-overflow ellipsis
        color $primary
        cursor pointer
    .csc-cf-group-popover-bottom
        margin-left 30px
    .cf-destination-disabled
        color $cf-disabled-label
        .csc-cf-destination-link
            color $cf-disabled-link
        .csc-cf-destination-actions
            .q-icon
                color $cf-disabled-btn !important
        .csc-cf-destination-add-destination
            color $cf-disabled-link
            .q-icon
                color $cf-disabled-link !important
</style>
