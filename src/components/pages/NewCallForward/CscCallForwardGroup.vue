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
            <div
                class="row csc-cf-destination-cont"

            >
                <div class="col col-xs-12 col-md-4 text-right"></div>
                <div
                    class="col col-xs-12 col-md-2 text-center"
                    v-if="showAddDestBtn"
                >
                    <div
                        class='csc-cf-destination'
                        @click="addDestination"
                    >
                        <q-icon
                            name="add"
                            color="primary"
                            size="24px"
                        />
                        {{ $t('pages.newCallForward.addDestinationLabel') }}
                    </div>
                </div>
                <div class="col col-xs-12 col-md-6 "></div>
            </div>
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
            QIcon,
            QPopover,
            QList,
            QItem,
            QItemMain,
            QItemSide,
            CscNewCallForwardDestination
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
                return Math.random().toString(16).slice(2);
            },
            async addDestination(){
                await this.$store.dispatch('newCallForward/addDestination', {
                    forwardGroupId: this.group.id,
                    destination: " "
                });
                await this.$store.dispatch('newCallForward/loadForwardGroups');

            }
        }
    }
</script>

<style lang="stylus" rel="stylesheet/stylus">
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
</style>
