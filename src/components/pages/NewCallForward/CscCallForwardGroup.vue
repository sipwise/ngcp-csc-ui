<template>
    <div
        class="csc-cf-group"
        v-if="group.destinations.length > 0"
    >
        <div
            class="row csc-cf-destination-cont"
        >
                <div class="col col-xs-12 col-md-4 text-right csc-cf-group-title">
                    {{ groupTitle }}
                </div>
                <div class="col text-left col-xs-12 col-md-2 csc-cf-dest-number-cont">
                    <q-toggle
                        v-model="isEnabled"
                        @change="toggleGroupChange"
                    />
                </div>
                <div class="col col-xs-12 col-md-5 "></div>
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
            CscNewCallForwardDestination
        },
        data () {
            return {
                destinationInCreation: false,
                toggleGroup: true,
                isEnabled: true
            };
        },
        async mounted(){
            try{
                const isGroupEnabled =  await this.$store.dispatch('newCallForward/isGroupEnabled', this.group.name);
                this.isEnabled = isGroupEnabled;
            }
            catch(err){
                console.log(err)
            }
        },
        computed: {
            ...mapGetters('newCallForward', [
                'getOwnPhoneTimeout'
            ]),
            showAddDestBtn(){
                const destinations = this.group.destinations;
                for(let dest of destinations){
                    if(dest && dest.simple_destination && dest.simple_destination.length < 2){
                        return false;
                    }
                }
                return true;

            },
            groupTitle(){
                return ["csc-unconditional", "csc-timeout"].includes(this.group.name) ? `${this.$t('pages.newCallForward.timeoutGroupTitle')}` : "";
            }
        },
        methods: {
            // we need to generate key because destinations have no id
            genKey(){
                return Math.random();
            },
            async addDestination(){
                this.destinationInCreation = true;
                await this.$store.dispatch('newCallForward/addDestination', {
                    forwardGroupId: this.group.id,
                    destination: " "
                });
                await this.$store.dispatch('newCallForward/loadForwardGroups');
                this.destinationInCreation = false;

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
            },
            toggleGroupChange(){
                this.$store.dispatch('newCallForward/enableGroup', {
                    groupName: this.group.name,
                    enabled: this.isEnabled
                });
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
    .cf-destination-disabled
        color $cf-disabled-label
        .csc-cf-timeout,
        .csc-cf-destination
            color $cf-disabled-link
        .csc-cf-destination-actions
            .q-icon
                color $cf-disabled-btn !important
        .csc-cf-destination-add-destination
            color $cf-disabled-link
            .q-icon
                color $cf-disabled-link !important
</style>
