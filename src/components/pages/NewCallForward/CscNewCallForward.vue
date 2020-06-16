<template>
    <csc-page
        class="csc-simple-page"
    >
        <div
            class="csc-cf-row row"
        >
            <div
                class="col col-xs-12 col-md-4 csc-cf-group-title"
                v-if="this.groupsCount > 0"
            >
                {{ $t('pages.newCallForward.titles.mainTitle', {number: this.subscriberDisplayName}) }}
            </div>
            <div
                class="col col-xs-12 col-md-4 csc-cf-group-title"
                v-else
            >
                {{$t('pages.newCallForward.primarNumberEnabled')}} {{ subscriberDisplayName }}
            </div>
            <div
                class="col col-xs-12 col-md-2 text-left csc-cf-self-number-cont"
            >
                <q-toggle
                    v-if="forwardGroups.length > 0"
                    v-model="toggleDefaultNumber"
                    @change="toggleChange" />
            </div>
            <div
                class="col col-xs-12 col-md-6"
            >
            </div>
        </div>
        <div
            class="csc-cf-row row"
            v-for="(forwardGroup, item) in forwardGroups"
            :key="forwardGroup.id"
        >
            <csc-cf-group
                v-if="!groupInCreation"
                :group="forwardGroup"
                :toggleDefaultNumber="toggleDefaultNumber"
            />
        </div>
        <div class="csc-cf-row row">
            <div
                class="column col col-xs-12 col-md-4"
            >
                <q-spinner-dots
                    v-if="groupsLoading"
                    class="csc-call-spinner"
                    color="primary"
                    :size="24"
                />
            </div>
        </div>
        <div class="csc-cf-row row">
            <div
                class="column col col-xs-12 col-md-4 items-end"
            >
                <div
                    class="csc-text-action"
                >
                    <q-icon
                        name="add"
                        color="primary"
                        size="24px"
                    />
                    {{ $t('pages.newCallForward.forwardBtnLabel') }}

                    <q-spinner-dots
                        v-if="groupInCreation"
                        color="primary"
                        :size="24"
                    />

                    <q-popover
                        ref="destsetTypeForm"
                        class="cf-popover-bottom"
                        @open="resetSelectFwdGroup()"
                        @close="addForwardGroup()"

                    >
                        <csc-new-call-forward-destinationset-type-select
                            ref="destsetTypeForm"
                        />
                    </q-popover>


                </div>

            </div>
        </div>
    </csc-page>
</template>


<script>
    import {
        mapGetters,
    } from 'vuex'
    import {
        showGlobalWarning
    } from '../../../helpers/ui'
    import {
        QSpinnerDots,
        QField,
        QToggle,
        QBtn,
        QPopover,
        QList,
        QItem,
        QItemMain,
        QIcon
    } from 'quasar-framework'
    import CscPage from '../../CscPage'
    import CscNewCallForwardDestination from './CscNewCallForwardDestination'
    import CscNewCallForwardAddDestinationForm from './CscNewCallForwardAddDestinationForm'
    import CscNewCallForwardDestinationsetTypeSelect from './CscNewCallForwardDestinationsetTypeSelect'
    import CscCfGroup from "./CscCallForwardGroup";
    export default {
        components: {
            CscCfGroup,
            CscPage,
            CscNewCallForwardDestination,
            CscNewCallForwardAddDestinationForm,
            CscNewCallForwardDestinationsetTypeSelect,
            showGlobalWarning,
            QSpinnerDots,
            QField,
            QToggle,
            QBtn,
            QPopover,
            QList,
            QItem,
            QItemMain,
            QIcon
        },
        data () {
            return {
                groupInCreation: false,
                groupsLoading: false,
                toggleDefaultNumber: true
            };
        },
        async mounted(){
            this.groupsLoading = true;
            try{
                await this.$store.dispatch('newCallForward/loadMappings');
                await this.$store.dispatch('newCallForward/loadSourcesets');
                await this.$store.dispatch('newCallForward/loadTimesets');
                await this.$store.dispatch('newCallForward/loadForwardGroups');
                let unconditionalGroups = await this.$store.dispatch('newCallForward/getForwardGroupByName', 'unconditional');
                this.toggleDefaultNumber = !unconditionalGroups;
            }
            catch(err){
                console.log(err)
            }

            this.groupsLoading = false;

        },
        computed: {
            ...mapGetters('newCallForward', [
                'subscriberDisplayName',
                'forwardGroups',
                'selectedDestType'
            ]),
            groupsCount(){
                return this.forwardGroups.length;
            }
        },
        methods: {
            async addForwardGroup(){
                this.groupInCreation = true;
                const selectedDestType = this.selectedDestType;
                let tempGroups = this.forwardGroups.filter(($group)=>{
                    return $group.id.toString().indexOf('temp-') > -1;
                });

                if(tempGroups.length > 0){
                    showGlobalWarning(`${this.$t('pages.newCallForward.addDestinationAlert')}`, 5000);
                }
                else{
                    switch(selectedDestType){
                        case "unconditional":{
                            if(this.toggleDefaultNumber){
                                const tempTimeoutFwdGroup = await this.$store.dispatch('newCallForward/getForwardGroupById', 'temp-csc-timeout');
                                if(!tempTimeoutFwdGroup){
                                    await this.$store.dispatch('newCallForward/addTempGroup','timeout' );
                                }
                            }
                            else{
                                const tempUnconditionalFwdGroup = await this.$store.dispatch('newCallForward/getForwardGroupById', 'temp-csc-unconditional');
                                if(!tempUnconditionalFwdGroup){
                                    await this.$store.dispatch('newCallForward/addTempGroup','unconditional' );
                                }
                            }
                        }
                        break;
                        case "unconditional-from":{
                            if(this.toggleDefaultNumber){
                                const tempTimeoutFwdGroup = await this.$store.dispatch('newCallForward/getForwardGroupById', 'temp-csc-timeout-from');
                                if(!tempTimeoutFwdGroup){
                                    await this.$store.dispatch('newCallForward/addTempGroup','timeoutFrom' );
                                }
                            }
                            else{
                                const tempUnconditionalFwdGroup = await this.$store.dispatch('newCallForward/getForwardGroupById', 'temp-csc-unconditional-from');
                                if(!tempUnconditionalFwdGroup){
                                    await this.$store.dispatch('newCallForward/addTempGroup','unconditionalFrom' );
                                }
                            }
                        }
                        break;
                        case "offline":{
                            await this.$store.dispatch('newCallForward/addTempGroup','offline' );
                        }
                        break;
                        case "busy":{
                            await this.$store.dispatch('newCallForward/addTempGroup','busy' );
                        }
                        break;
                    }
                }
                this.groupInCreation = false;
            },
            showForm(){
                this.$refs.destinationType.close();
                this.$refs.addDestinationForm.add();
            },
            async toggleChange(){
                this.groupInCreation = true;
                await this.$store.dispatch('newCallForward/forwardAllCalls', !this.toggleDefaultNumber);
                this.groupInCreation = false;
            },
            async resetSelectFwdGroup(){
                await this.$store.dispatch('newCallForward/setSelectedDestType', null);
            }
        }
    }
</script>

<style lang="stylus" rel="stylesheet/stylus">
    @import '../../../themes/app.common.styl'
    .csc-cf-flat-btn
        color $primary
        float right
    .csc-cf-group-title
        text-align right
    .csc-cf-destinations-cont
        margin-top 25px
    .csc-cf-field-toggle
        margin-top 0px;
    .csc-call-spinner
        margin-left auto
    .csc-cf-self-number-cont
        padding-left 30px
        width 150px
        white-space nowrap
        overflow hidden
        text-overflow ellipsis
    .cf-popover-bottom
        min-width 150px
        margin-left 5px

</style>
