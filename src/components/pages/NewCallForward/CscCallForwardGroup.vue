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

                    {{groupTitle}}

                    <span
                        class="csc-cf-destination-add-condition"
                        v-if="isTempGroup"
                    >
                        {{ $t('pages.newCallForward.conditionBtnLabelPrefix') }}
                        <span class="csc-cf-from-link">
                            {{ $t('pages.newCallForward.conditionBtnLabel') }}
                        </span>
                        <q-popover
                            ref="conditions"
                            @open="showConditions()"
                            @close="showFirstDestMenu()"
                        >
                            <csc-new-call-forward-condition-type-select
                                ref="addCondition"
                                :enabled="true"
                                :groupName="group.name"
                                :groupId="group.id"
                            />
                        </q-popover>
                    </span>

                    <span
                        class="csc-cf-destination-add-condition"
                        v-if="!groupSourceset && !isTempGroup"
                    >
                        {{ $t('pages.newCallForward.conditionBtnLabelPrefix') }}
                        <span class="csc-cf-from-link">
                            {{ $t('pages.newCallForward.conditionBtnLabel') }}
                        </span>
                        <q-popover
                            ref="conditions"
                            @open="showConditions()"
                            @close="showConditionForm()"
                        >
                            <csc-new-call-forward-condition-type-select
                                ref="addCondition"
                                :enabled="true"
                                :groupName="group.name"
                                :groupId="group.id"
                            />
                        </q-popover>
                         <q-popover
                            ref="onlineSourceset"
                            class="csc-cf-number-form"
                            v-bind:class="{ 'csc-cf-popover-hide': toggleConditionFromForm}"
                            @open="showSourcesetForm()"
                            @close="resetToggleCondition()"
                        >
                            <csc-new-call-forward-add-sourceset-form
                                ref="addSourceSet"
                                :enabled="true"
                                :groupName="group.name"
                                :groupId="group.id"
                            />
                        </q-popover>
                    </span>

                    <span
                        v-if="groupSourceset"
                    >
                        {{ $t('pages.newCallForward.conditionBtnLabelPrefix') }}
                        <span class="csc-cf-from-link">
                            {{ $t('pages.newCallForward.fromLabelShort') +'"'+ groupSourceset +'"'}}
                        </span>
                        <q-popover
                            ref="sourcesList"
                            class="csc-cf-number-form"
                            @open="showSources()"
                        >
                            <csc-new-call-forward-edit-sources
                                ref="editSources"
                                :sourceSetName="groupSourceset"
                                :sourceSetId="sourceSet.id"
                                :groupName="group.name"
                                :groupId="group.id"
                            />
                        </q-popover>

                    </span>
                </div>
                <div class="col text-left col-xs-12 col-md-2 csc-cf-dest-number-cont">
                    <q-toggle
                        v-model="isEnabled"
                        @change="toggleGroupChange"
                    />
                </div>
                <div class="col col-xs-12 col-md-5 csc-cf-group-actions">
                    <q-icon
                        name="delete"
                        color="negative"
                        size="24px"
                        @click="showConfirmDialog"
                    />
                    <csc-confirm-dialog
                        ref="confirmDialog"
                        title-icon="delete"
                        :title="$t('pages.newCallForward.cancelGroupDialogTitle', {groupName: this.group.name})"
                        :message="$t('pages.newCallForward.cancelGroupDialogText', {groupName: this.group.name})"
                        @confirm="confirmDeleteGroup"
                    />
                    <q-spinner-dots
                        v-if="groupIsLoading"
                        class="csc-call-spinner"
                        color="primary"
                        :size="24"
                    />
                </div>
        </div>

        <div
            class="csc-cf-row row"
            v-if="isTimeoutOrUnconditional"
        >
            <div
                class="col col-xs-12 col-md-4 text-right"
            >
                {{ toggleLabel }}
            </div>
            <div
                class="col col-xs-12 col-md-2 text-left csc-cf-self-number-cont"
            >
                {{ subscriberDisplayName }}
            </div>

            <div
                class="col col-xs-12 col-md-6"

            >
            </div>
        </div>

        <div
            v-for="(destination, index) in group.destinations"
            :key="genKey()"
        >
            <csc-new-call-forward-destination
                :destination="getDestination(index)"
                ref="destination"
                :index="index"
                :groupId="group.id"
                :groupName="group.name"
                :allCallsFwd="(['csc-unconditional', 'csc-busy', 'csc-offline'].includes(group.name) &&  index === 0)"
                :class="{ 'csc-cf-destination-disabled': !isEnabled }"

            />
        </div>
        <div
            class="row csc-cf-destination-cont"
        >
                <div class="col col-xs-12 col-md-4 text-right"></div>
                <div
                    class="col col-xs-12 col-md-2 text-left"
                    v-if="showAddDestBtn"
                    :class="{ 'csc-cf-destination-disabled': !isEnabled }"
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
                            :groupId="this.group.id"
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
        showGlobalWarning
    } from '../../../helpers/ui'
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
    import CscConfirmDialog from "../../CscConfirmationDialog";
    import CscNewCallForwardDestination from './CscNewCallForwardDestination'
    import CscNewCallForwardAddDestinationForm from './CscNewCallForwardAddDestinationForm'
    import CscNewCallForwardEditSources from './CscNewCallForwardEditSources'
    import CscNewCallForwardAddSourcesetForm from './CscNewCallForwardAddSourcesetForm'
    import CscNewCallForwardConditionTypeSelect from './CscNewCallForwardConditionTypeSelect'
    import CscNewCallForwardDestinationTypeForm from './CscNewCallForwardDestinationTypeForm'
    export default {
        name: 'csc-cf-group',
        props: [
            'group',
            'toggleDefaultNumber'
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
            CscConfirmDialog,
            CscObjectSpinner,
            showGlobalWarning,
            CscNewCallForwardDestination,
            CscNewCallForwardAddDestinationForm,
            CscNewCallForwardEditSources,
            CscNewCallForwardAddSourcesetForm,
            CscNewCallForwardConditionTypeSelect,
            CscNewCallForwardDestinationTypeForm
        },
        data () {
            return {
                toggleGroup: true,
                isEnabled: true,
                toggleNumberForm: true,
                toggleConditionFromForm: true,
                groupIsLoading: false,
                sourceSet: null,
                sources: [],
                firstDestinationInCreation: false
            };
        },
        async mounted(){
            try{
                if(!this.inCreation){
                    const isGroupEnabled =  await this.$store.dispatch('newCallForward/isGroupEnabled', {groupName: this.group.name, id: this.group.id});
                    this.isEnabled = isGroupEnabled;
                }
                await this.updateSourcesetNames()
            }
            catch(err){
                console.log(err)
            }
        },
        computed: {
            ...mapGetters('newCallForward', [
                'subscriberDisplayName',
                'getGroupsLoaders',
                'getOwnPhoneTimeout',
                'groupsCount',
                'getMappings',
                'getGroupsLoaders',
                'getSourcesets',
                'getFirstDestinationInCreation'
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
                    case "csc-unconditional-from":
                    case "csc-timeout-from":
                         title = `${this.$t('pages.newCallForward.titles.timeoutGroupFromPre')}`;
                    break;
                    case "csc-offline":
                        title = `${this.$t('pages.newCallForward.titles.offlineGroup')}`;
                    break;
                    case "csc-busy":
                        title = `${this.$t('pages.newCallForward.titles.busyGroup')}`;
                    break;
                }
                return title;
            },
            groupSourceset(){
                return this.sourceSet ? this.sourceSet.name : false;
            },
            isTempGroup(){
                return this.group.id.toString().includes('temp-');
            },
            isFirstDestInCreation(){
                return this.group.id.toString() === this.getFirstDestinationInCreation;
            },
            toggleLabel(){
                return this.toggleDefaultNumber ? `${this.$t('pages.newCallForward.primarNumberEnabled')}` : `${this.$t('pages.newCallForward.primarNumberDisabled')}`;
            },
            isTimeoutOrUnconditional(){
                return this.group.name.includes( 'unconditional')  || this.group.name.includes('timeout');
            }
        },
        watch: {
            getSourcesets: function () {
                 this.updateSourcesetNames();
            },
            getGroupsLoaders: function(){
                const groupLoaders = this.getGroupsLoaders;
                this.groupIsLoading =  groupLoaders.includes(this.group.id);
            },
            getFirstDestinationInCreation: function(){
                if(this.getFirstDestinationInCreation === this.group.id.toString()){
                    this.toggleConditionFromForm = false;
                    this.$refs.onlineSourceset.open();
                }
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
                        await this.$store.dispatch('newCallForward/addGroupLoader', this.group.id);
                        await this.$store.dispatch('newCallForward/addVoiceMail', this.group.id);
                        await this.$store.dispatch('newCallForward/loadForwardGroups');
                        await this.$store.dispatch('newCallForward/removeGroupLoader', this.group.id);
                    break;
                }
            },
            showFirstDestMenu(){
                const firstDestinationCmp = this.$refs.destination[0];
                firstDestinationCmp.firstDestinationInCreation = true;
                firstDestinationCmp.$refs.destTypeForm.open();
                showGlobalWarning(`${this.$t('pages.newCallForward.mandatoryDestinationLabel')}`, 5000);
            },
            showConditionForm(){
                debugger
                const action = this.$refs.addCondition.action;
                switch(action){
                    case "addFromCondition":
                        this.toggleConditionFromForm = false;
                        this.$refs.onlineSourceset.open();
                    break;
                    case "addDateIsCondition":
                        debugger
                    break;
                }


            },
            showDestTypeForm(){
                this.toggleNumberForm = true;
                this.$refs.selectDestinationType.add();
            },
            getDestName(index){
                return "destination" + index;
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
                await this.$store.dispatch('newCallForward/addGroupLoader', this.group.id);
                await this.$store.dispatch('newCallForward/enableGroup', {
                    groupName: this.group.name,
                    id: this.group.id,
                    enabled: this.isEnabled
                });
                await this.$store.dispatch('newCallForward/removeGroupLoader', this.group.id);
            },
            showConditions(){
                this.$refs.addCondition.add();
            },
            showSourcesetForm(){
                this.$refs.addSourceSet.add();
            },
            showSources(){
                this.$refs.editSources.add();
            },
            resetToggleCondition(){
                this.toggleConditionFromForm = true;
            },

            async updateSourcesetNames(){
                const mappings = this.getMappings;
                const groupMappingId = await this.$store.dispatch('newCallForward/getMappingIdByGroupName', this.group.name);
                let groupMapping, sourceSet;
                if(mappings[groupMappingId]){
                    groupMapping =  mappings[groupMappingId].filter(($mapping)=>{
                        return $mapping.destinationset_id == this.group.id;
                    });
                    sourceSet = groupMapping[0] && groupMapping[0].sourceset_id ? await this.$store.dispatch('newCallForward/getSourcesetById', groupMapping[0].sourceset_id) :  null;

                    if(sourceSet){
                        this.sourceSet = sourceSet;
                        this.sources = this.sourceSet.sources;
                    }
                    else{
                        this.sourceSet = null;
                        this.sources = [];
                    }
                }
            },
            showConfirmDialog(){
                this.$refs.confirmDialog.open();
            },
            async confirmDeleteGroup(){
                try{
                    await this.$store.dispatch('newCallForward/addGroupLoader', this.group.id);
                    await this.$store.dispatch('newCallForward/deleteForwardGroup', this.group);
                    await this.$store.dispatch('newCallForward/loadForwardGroups');
                    await this.$store.dispatch('newCallForward/removeGroupLoader', this.group.id);
                }
                catch(e){
                    console.log(e)
                }

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
    .csc-cf-destination-label
        text-align right
    .csc-cf-destination-value
        text-align center
    .csc-cf-destination-add-condition
        font-size 16px
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
    .csc-cf-from-link
        color $primary
        cursor pointer
	.csc-cf-group-actions
        cursor pointer
    .csc-cf-destination-disabled
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
