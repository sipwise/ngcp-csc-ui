<template>
    <div
        class="csc-cf-group"
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
                :destination="destination"
                :index="index"
                :groupId="group.id"
            />
        </div>

        <div class="row csc-cf-destination-cont">
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

        <!-- <div
            class="row"
        >
            <div
                class="csc-cf-destination-label col col-4"
            >
                {{ $t('pages.newCallForward.allCallsForwardedTo') }}
            </div>
            <div
                class="csc-cf-destination-value col col-2"
            >
                <span
                    class="csc-text-action"
                >
                    {{ $t('pages.newCallForward.addDestinationLabel') }}
                    <q-popover
                        ref="groupMenu"
                        :disable="true"
                    >
                        <q-list
                            link
                            no-border
                        >
                            <q-item
                            >
                                <q-item-side
                                    icon="number"
                                />
                                <q-item-main>
                                    Number
                                </q-item-main>
                            </q-item>
                        </q-list>
                    </q-popover>
                </span>
            </div>
            <div
                class="csc-cf-destination-actions col col-6"
            >
                <q-icon
                    name="delete"
                    color="negative"
                    size="24px"
                />
            </div>
        </div> -->
    </div>
</template>


<script>

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
    .csc-cf-destination-actions
        text-align left
    .csc-cf-destination-add-destination
        padding-left 25px
        width 250px
        white-space nowrap
        overflow hidden
        text-overflow ellipsis
        color $primary
        cursor pointer
</style>
