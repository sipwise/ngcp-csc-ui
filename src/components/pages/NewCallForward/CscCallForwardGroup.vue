<template>
    <div
        class="csc-cf-group"
        v-if="group.destinations.length > 0"
    >

    <!-- <csc-object-spinner
    /> -->
        <div
            v-if="group.id !== 'unconditional'"
            class="csc-cf-group-title"
        >
            {{ group.title }}
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
            />
        </div>
        <div
            class="row csc-cf-destination-cont"
        >
                <div class="col col-xs-12 col-md-4 text-right"></div>
                <div
                    class="col col-xs-12 col-md-2 text-left"
                    v-if="showAddDestBtn"
                >
                    <div
                        class='csc-cf-destination-add-destination'
                        @click="addDestination"
                    >
                        <q-icon
                            name="add"
                            color="primary"
                            size="24px"
                        />
                        {{ $t('pages.newCallForward.addDestinationLabel') }}

                        <q-spinner-dots
                            v-if="destinationInCreation"
                            class="csc-call-spinner"
                            color="primary"
                            :size="24"
                        />

                    </div>
                    <q-popover
                        ref="destTypeForm"
                        anchor="top right"
                        @open="showDestTypeForm()"
                        @close="showNext()"
                    >
                        <csc-new-call-forward-destination-type-form
                            ref="selectDestinationType"
                        />
                    </q-popover>
                    <q-popover
                        ref="numberForm"
                        anchor="top right"
                        class="csc-cf-number-form"
                        v-bind:class="{ 'csc-cf-popover-hide': toggleNumberForm }"
						@open="showNewDestNumber()"
                    >
                        <csc-new-call-forward-add-destination-form
                            ref="addDestinationForm"
                            :groupName="this.group.name"
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
        QIcon,
        QPopover,
        QList,
        QItem,
        QItemMain,
        QItemSide
    } from 'quasar-framework'
    import CscObjectSpinner from "../../CscObjectSpinner";
    import CscNewCallForwardDestination from './CscNewCallForwardDestination'

    export default {
        name: 'csc-cf-group',
        props: [
            'group'
        ],
        components: {
            QSpinnerDots,
            QIcon,
            QPopover,
            QList,
            QItem,
            QItemMain,
            QItemSide,
            CscObjectSpinner,
            CscNewCallForwardDestination
        },
        data () {
            return {
                destinationInCreation: false
            };
        },
        computed: {
            ...mapGetters('newCallForward', [
                'getOwnPhoneTimeout'
            ]),
            showAddDestBtn(){
                const destinations = this.group.destinations;
                for(let dest of destinations){
                    if(dest && (dest.simple_destination && dest.simple_destination.length < 2 || dest.destination.includes('voicebox.local'))){
                        return false;
                    }
                }
                return true;

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
                        await this.$store.dispatch('newCallForward/addVoiceMail', this.group.id);
                        await this.$store.dispatch('newCallForward/loadForwardGroups');
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
                    destination.timeout = this.getOwnPhoneTimeout;
                }
                else {
                    destination.timeout = this.group.destinations[index-1].timeout;
                }
                return destination;
            }
        }
    }
</script>

<style lang="stylus" rel="stylesheet/stylus">
    @import '../../../themes/app.common.styl'
    .csc-cf-group
        width 100%
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
</style>
