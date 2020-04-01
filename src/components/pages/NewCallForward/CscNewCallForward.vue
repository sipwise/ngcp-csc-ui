<template>
    <csc-page
        class="csc-simple-page"
    >
        <div
            class="csc-cf-row row"
        >
            <div
                class="col col-xs-12 col-md-4 text-right"
            >
                {{ toggleLabel }}
            </div>
            <div
                class="col col-xs-12 col-md-2 text-left csc-cf-self-number-cont"
            >
                {{ primaryNumber | number }}
            </div>

            <div
                class="col col-xs-12 col-md-6"

            >
                <q-toggle
                    v-if="forwardGroups.length > 0"
                    v-model="toggleDefaultNumber"
                    @change="toggleChange" />
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
                        anchor="top right"
                        @close="addForwardGroup()"

                    >
                        <csc-new-call-forward-destinationset-type-select
                            ref="destsetTypeForm"
                        />
                    </q-popover>
                </div>



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

    </csc-page>
</template>


<script>
    import {
        mapGetters,
    } from 'vuex'
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
                await this.$store.dispatch('newCallForward/loadForwardGroups');
                let unconditionalGroup = await this.$store.dispatch('newCallForward/getForwardGroupByName', 'unconditional');
                this.toggleDefaultNumber = !unconditionalGroup || unconditionalGroup.destinations.length < 1;
            }
            catch(err){
                console.log(err)
            }

            this.groupsLoading = false;

        },
        computed: {
            ...mapGetters('newCallForward', [
                'primaryNumber',
                'subscriberDisplayName',
                'forwardGroups'
            ]),
            primaryNumberEnabled(){
                return true;
            },
            toggleLabel(){
                return this.toggleDefaultNumber ? `${this.$t('pages.newCallForward.primarNumberEnabled')}` : `${this.$t('pages.newCallForward.primarNumberDisabled')}`;
            }
        },
        methods: {
            async addForwardGroup(){
                this.groupInCreation = true;
                if(this.toggleDefaultNumber){
                    const timeoutFwdGroup = await this.$store.dispatch('newCallForward/getForwardGroupByName', 'timeout');
                    if(!timeoutFwdGroup){
                        //await this.$store.dispatch('newCallForward/addForwardGroup', 'timeout');
                        await this.$store.dispatch('newCallForward/addTempDestination','timeout' );
                        //await this.$store.dispatch('newCallForward/loadForwardGroups');
                    }
                }
                else{
                    const unconditionalFwdGroup = await this.$store.dispatch('newCallForward/getForwardGroupByName', 'unconditional');
                    if(!unconditionalFwdGroup){
                        //await this.$store.dispatch('newCallForward/addForwardGroup', 'unconditional');
                        await this.$store.dispatch('newCallForward/addTempDestination','unconditional' );
                        //await this.$store.dispatch('newCallForward/loadForwardGroups');
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
            addVoicemail(){}
        }
    }
</script>

<style lang="stylus" rel="stylesheet/stylus">
    @import '../../../themes/app.common.styl'
    .csc-cf-flat-btn
        color $primary
        float right
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

</style>
