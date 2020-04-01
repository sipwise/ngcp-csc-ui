<template>
    <div
        class="csc-cf-group"
        v-if="group.destinations.length > 0"
    >
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
                :allCallsFwd="group.name == 'csc-timeout' && index === 0"
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
                    if(dest && dest.simple_destination && dest.simple_destination.length < 2){
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
