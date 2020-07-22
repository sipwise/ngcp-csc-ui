<template>
    <div
        class="csc-cf-group"
        v-if="group.destinations.length > 0"
    >

        <div
            class="row csc-cf-destination-cont"
        >
                <div
                    class="col col-xs-12 col-md-4 text-right csc-cf-group-title-bold"
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
                                :disableSourcesetMenu="false"
                                :disableTimesetMenu="false"
                                :disableDateRangeMenu="false"
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
                    <span
                        v-if="groupTimeset && !isRange"
                    >
                        {{ $t('pages.newCallForward.conditionBtnLabelPrefix') }}
                        <span class="csc-cf-from-link">
                            {{ $t('pages.newCallForward.dateIsShort') + groupTimeset }}
                        </span>
                        <q-popover
                            ref="day"
                            @open="showQDate()"
                        >
                            <q-datetime
                                ref="dayWidget"
                                clear-label="REMOVE"
                                v-model="dayModel"
                                :min="today"
                                />
                        </q-popover>
                        <csc-confirm-dialog
                            ref="confirmDeleteTimesetDialog"
                            title-icon="delete"
                            :title="$t('pages.newCallForward.cancelTimesetDialogTitle', {name: this.groupTimeset})"
                            :message="$t('pages.newCallForward.cancelTimesetText', {name: this.groupTimeset})"
                            @confirm="deleteTimeset"
                        />

                    </span>
                    <span
                        v-if="groupTimeset && isRange"
                    >
                        {{ $t('pages.newCallForward.conditionBtnLabelPrefix') }}
                        <span class="csc-cf-from-link" ref="isRangeLink">
                            {{ $t('pages.newCallForward.dateRangeShort') + groupTimeRange }}
                        </span>
                        <q-popover
                            ref="daterange"
                            class="csc-cf-calendar-day"
                            enabled="enabled"
                        >
                            <q-field
                                label="Date range"
                                :labelWidth="11"
                                class="csc-cf-popover-daterange-title"
                            />
                            <q-field
                              dark
                              :helper="$t('pages.newCallForward.dateRangeDateHelper')"
                            >
                                <q-datetime-range
                                    ref="dayRangeWidget"
                                    type="date"
                                    no-clear
                                    v-model="rangeDateModel"
                                    :min="today"
                                    @change="rangeDateChanged()"
                                    format="DD/MM/YYYY"
                                    :after="[
                                        {
                                          icon: 'today'
                                        }
                                      ]"
                                    />
                            </q-field>
                            <q-field
                              dark
                              :helper="$t('pages.newCallForward.dateRangeTimeHelper')"
                            >
                                <q-datetime-range
                                    ref="dayRangeWidget"
                                    type="time"
                                    no-clear
                                    v-model="rangeTimeModel"
                                    @change="rangeTimeChanged()"
                                    :after="[
                                        {
                                          icon: 'access_time'
                                        }
                                      ]"
                                    />
                            </q-field>
                            <div
                                class="csc-cf-daterange-btn-cont"
                            >
                                <q-btn
                                    flat
                                    color="red"
                                    icon="delete"
                                    @mousedown.native="showRemoveDateRangeDialog()"
                                >
                                    {{ $t('buttons.remove') }}
                                    <csc-confirm-dialog
                                        ref="confirmDeleteTimesetDialog"
                                        title-icon="delete"
                                        :title="$t('pages.newCallForward.cancelTimesetDialogTitle', {name: this.groupTimeRange})"
                                        :message="$t('pages.newCallForward.cancelTimesetText', {name: this.groupTimeRange})"
                                        @confirm="deleteTimeset"
                                    />
                                </q-btn>
                                <q-btn
                                    flat
                                    color="default"
                                    icon="clear"
                                    @mousedown.native="cancelTimerange()"
                                >
                                    {{ $t('buttons.cancel') }}
                                </q-btn>
                                <q-btn
                                    flat
                                    color="primary"
                                    icon="done"
                                    @click="saveDateRange();"
                                    :disable="!allFieldsFilled"
                                >
                                    {{ $t('buttons.save') }}
                                </q-btn>
                            </div>
                        </q-popover>
                    </span>
                    <span
                        class="csc-cf-destination-add-condition"
                        v-if="!isTempGroup && !(groupSourceset && groupTimeset)"
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
                                :disableSourcesetMenu="!groupSourceset"
                                :disableTimesetMenu="!groupTimeset"
                                :disableDateRangeMenu="!groupTimeset"
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
            class="csc-cf-destination-cont row"
            v-if="isTimeoutOrUnconditional"
        >
            <div
                class="col col-xs-12 col-md-4 text-right"
                :class="{ 'csc-cf-destination-disabled': !isEnabled }"
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

    import moment from 'moment'

    import {
        mapGetters,
    } from 'vuex'

    import {
        QSpinnerDots,
        QToggle,
        QIcon,
        QDatetime,
        QDatetimeRange,
        QPopover,
        QField,
        QBtn,
        QList,
        QItem,
        QItemMain,
        QItemSide,
        date
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
            QDatetime,
            QDatetimeRange,
            QPopover,
            QField,
            QBtn,
            QList,
            QItem,
            QItemMain,
            QItemSide,
            CscConfirmDialog,
            CscObjectSpinner,
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
                timeSet: null,
                times:[],
                action: null,
                enabled: false,
                day: null,
                rangeDateModel: {
                    from: null,
                    to: null
                },
                rangeTimeModel: {
                    from: null,
                    to: null
                },
                today: new Date(),
                firstDestinationInCreation: false
            };
        },
        async mounted(){
            try{
                if(!this.inCreation){
                    const isGroupEnabled =  await this.$store.dispatch('newCallForward/isGroupEnabled', {groupName: this.group.name, id: this.group.id});
                    this.isEnabled = isGroupEnabled;
                }
                this.updateSourcesetNames();
                this.updateTimeSetNames();
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
                'getTimesets',
                'getFirstDestinationInCreation'
            ]),
            allFieldsFilled(){
                return this.rangeDateModel.from !== null &&
                       this.rangeDateModel.to !== null &&
                       this.rangeTimeModel.from !== null &&
                       this.rangeTimeModel.to !== null;
            },
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
            groupTimeset(){
                let retVal = false, dateN, time;
                if(this.timeSet && this.timeSet.times && this.timeSet.times.length > 0){
                    time = this.timeSet.times[0];
                    dateN = new Date(parseInt(time.year), parseInt(time.month) - 1 , parseInt(time.mday), 0, 0, 0, 0);
                    retVal = date.formatDate( dateN, 'ddd, MMM D YYYY')
                }
                return retVal;
            },
            groupTimeRange(){
                let retVal = false, startDateN, endDateN, time;
                if(this.timeSet && this.timeSet.times && this.timeSet.times.length > 0){
                    time = this.timeSet.times[0];
                    startDateN = new Date(parseInt(time.year.split('-')[0]), parseInt(time.month.split('-')[0]) - 1 , parseInt(time.mday.split('-')[0]), 0, 0, 0, 0);
                    endDateN = new Date(parseInt(time.year.split('-')[1]), parseInt(time.month.split('-')[1]) - 1 , parseInt(time.mday.split('-')[1]), 0, 0, 0, 0);
                    retVal = date.formatDate( startDateN, 'ddd, MMM D YYYY') +' - '+ date.formatDate( endDateN, 'ddd, MMM D YYYY')
                }
                return retVal;
            },
            isRange(){
                const isRange = this.timeSet
                        && this.timeSet.times
                        && this.timeSet.times.length > 0
                        && this.timeSet.times[0].year
                        && this.timeSet.times[0].year.includes('-');
                return isRange;
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
            },
            dayModel: {
                get() {
                    let time = this.timeSet.times[0];
                    let dateN = new Date(parseInt(time.year), parseInt(time.month) - 1 , parseInt(time.mday), 0, 0, 0, 0);
                    return dateN;
                },
                 set(value) {
                     if(value !== ""){
                         this.addTimeToExistingTimeset(value);
                     }
                     else{
                         this.showConfirmDeleteTimesetDialog()
                     }
                }
            }
        },
        watch: {
            getSourcesets: function () {
                 this.updateSourcesetNames();
            },
            getTimesets: function () {
                 this.updateTimeSetNames();
            },
            getGroupsLoaders: function(){
                const groupLoaders = this.getGroupsLoaders;
                this.groupIsLoading =  groupLoaders.includes(this.group.id);
            },
            getFirstDestinationInCreation: function(){
                if(this.getFirstDestinationInCreation === this.group.id.toString()){
                    this.toggleConditionFromForm = false;
                    this.$refs.conditions.open();
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
                        this.$store.dispatch('newCallForward/addGroupLoader', this.group.id);
                        await this.$store.dispatch('newCallForward/addVoiceMail', this.group.id);
                        this.$store.dispatch('newCallForward/loadForwardGroups');
                        this.$store.dispatch('newCallForward/removeGroupLoader', this.group.id);
                    break;
                }
            },
            showFirstDestMenu(){
                const firstDestinationCmp = this.$refs.destination[0];
                firstDestinationCmp.firstDestinationInCreation = true;
                if(this.group.name.includes('timeout') || this.group.name.includes('unconditional')){
                    firstDestinationCmp.movePopoverTimeoutToTop();
                }
                else{
                    firstDestinationCmp.movePopoverToTop();
                }

                firstDestinationCmp.$refs.destTypeForm.open();
            },
            showConditionForm(){
                const action = this.$refs.addCondition.action;
                switch(action){
                    case "addFromCondition":
                        this.toggleConditionFromForm = false;
                        this.$refs.onlineSourceset.open();
                    break;
                    case "addDateIsCondition":
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
                this.$store.dispatch('newCallForward/addGroupLoader', this.group.id);
                await this.$store.dispatch('newCallForward/enableGroup', {
                    groupName: this.group.name,
                    id: this.group.id,
                    enabled: this.isEnabled
                });
                this.$store.dispatch('newCallForward/removeGroupLoader', this.group.id);
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
            async updateTimeSetNames(){
                const mappings = this.getMappings;
                const groupMappingId = await this.$store.dispatch('newCallForward/getMappingIdByGroupName', this.group.name);
                let groupMapping, timeSet;
                if(mappings[groupMappingId]){
                    groupMapping =  mappings[groupMappingId].filter(($mapping)=>{
                        return $mapping.destinationset_id == this.group.id;
                    });
                    timeSet = groupMapping[0] && groupMapping[0].timeset_id ? await this.$store.dispatch('newCallForward/getTimesetById', groupMapping[0].timeset_id) :  null;
                    if(timeSet){
                        this.timeSet = timeSet;
                        this.times = this.timeSet.times;
                        if(this.times[0] && this.times[0].year && this.times[0].year.includes('-')){
                            const time = this.times[0];
                            this.rangeDateModel.from = moment(new Date(parseInt(time.year.split('-')[0]),parseInt(time.month.split('-')[0])-1,parseInt(time.mday.split('-')[0]),parseInt(time.hour.split('-')[0]),parseInt(time.minute.split('-')[0]),0,0)).format();
                            this.rangeDateModel.to = moment(new Date(parseInt(time.year.split('-')[1]),parseInt(time.month.split('-')[1])-1,parseInt(time.mday.split('-')[1]),parseInt(time.hour.split('-')[1]),parseInt(time.minute.split('-')[1]),0,0)).format();
                            this.rangeTimeModel.from = moment(new Date(parseInt(time.year.split('-')[0]),parseInt(time.month.split('-')[0])-1,parseInt(time.mday.split('-')[0]),parseInt(time.hour.split('-')[0]),parseInt(time.minute.split('-')[0]),0,0)).format();
                            this.rangeTimeModel.to = moment(new Date(parseInt(time.year.split('-')[1]),parseInt(time.month.split('-')[1])-1,parseInt(time.mday.split('-')[1]),parseInt(time.hour.split('-')[1]),parseInt(time.minute.split('-')[1]),0,0)).format();
                        }
                    }
                    else{
                        this.timeSet = null;
                        this.times = [];
                    }
                }
            },
            showConfirmDialog(){
                this.$refs.confirmDialog.open();
            },
            async confirmDeleteGroup(){
                try{
                    this.$store.dispatch('newCallForward/addGroupLoader', this.group.id);
                    await this.$store.dispatch('newCallForward/deleteForwardGroup', this.group);
                    this.$store.dispatch('newCallForward/loadForwardGroups');
                    this.$store.dispatch('newCallForward/removeGroupLoader', this.group.id);
                }
                catch(e){
                    console.log(e)
                }

            },
            showQDate(){
                this.$refs.dayWidget.open()
            },
            showConfirmDeleteTimesetDialog(){
                this.$refs.confirmDeleteTimesetDialog.open();
            },
            async deleteTimeset(){
                try{
                    this.$store.dispatch('newCallForward/addGroupLoader', this.group.id);
                    await this.$store.dispatch('newCallForward/deleteTimesFromTimeset', this.timeSet.id);
                    await this.$store.dispatch('newCallForward/loadTimesets');
                    this.$store.dispatch('newCallForward/loadMappings');
                    this.$store.dispatch('newCallForward/removeGroupLoader', this.group.id);
                }
                catch(e){
                    console.log(e)
                }
            },
            async addTimeToExistingTimeset(time){
                try{
                    this.$store.dispatch('newCallForward/addGroupLoader', this.group.id);
                    this.day = {
                        "year": date.formatDate(time, 'YYYY'),
                        "month": date.formatDate(time, 'M'),
                        "mday": date.formatDate(time, 'D')
                    }

                    const updatedTimeset = await this.$store.dispatch('newCallForward/addTimeToTimeset', {
                        id: this.timeSet.id,
                        time: this.day
                    });
                    this.$store.dispatch('newCallForward/editTimes', updatedTimeset);
                    this.$store.dispatch('newCallForward/removeGroupLoader', this.group.id);
                }
                catch(e){
                    console.log(e)
                }
            },
            rangeDateChanged(){
                this.$refs.isRangeLink.click();
            },
            rangeTimeChanged(){
                this.$refs.isRangeLink.click();
            },
            resetTimeRange(){
                this.rangeDateModel = {
                    from: null,
                    to: null
                };
                this.rangeTimeModel = {
                    from: null,
                    to: null
                };
            },
            cancelTimerange() {
                this.action = null;
                this.enabled = false;
                this.$refs.daterange.close();

            },
            formatRange(startDate, endDate, startTime, endTime){
                const startDateOnly = startDate.split('T')[0];
                const endDateOnly = endDate.split('T')[0];
                const startTimeOnly = startTime.split('T')[1];
                const endTimeOnly = endTime.split('T')[1];
                const getDateObj = date => (([year, month, day ]) => ({ day, year, month }))(date.split('-'));
                const getTimeObj = time => (([hour, minute, second]) => ({ hour, minute, second }))(time.split(':'));
                const startDateObj = getDateObj(startDateOnly);
                const endDateObj = getDateObj(endDateOnly);
                const startTimeObj = getTimeObj(startTimeOnly);
                const endTimeObj = getTimeObj(endTimeOnly);
                return [
                            {
                                year: startDateObj.year +'-'+endDateObj.year,
                                month: startDateObj.month +'-'+endDateObj.month,
                                mday: startDateObj.day +'-'+endDateObj.day,
                                hour: startTimeObj.hour +'-'+endTimeObj.hour,
                                minute:  startTimeObj.minute +'-'+endTimeObj.minute
                            }
                        ]
            },
            async saveDateRange(){
                const days = this.rangeDateModel;
                const time = this.rangeTimeModel;

                const datesTimesInRange = this.formatRange(days.from, days.to, time.from, time.to);
                this.$store.dispatch('newCallForward/addGroupLoader', this.group.id);
                const updatedTimeset = await this.$store.dispatch('newCallForward/addRangeToTimeset', {
                    id: this.timeSet.id,
                    times: datesTimesInRange
                });
                this.$refs.daterange.close();
                this.$store.dispatch('newCallForward/setTimeset', updatedTimeset);
                this.$store.dispatch('newCallForward/removeGroupLoader', this.group.id);
            },
            showRemoveDateRangeDialog(){
                this.$refs.daterange.close();
                this.showConfirmDeleteTimesetDialog();
            }
        }
    }
</script>

<style lang="stylus" rel="stylesheet/stylus">
    @import '../../../themes/app.common.styl'
    .csc-cf-group
        width 100%
    .csc-cf-group-title-bold
        text-align right
        font-weight bold
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
    .row.q-datetime-controls.modal-buttons-top
        button:first-child
            color red !important
            &:before
                font-family: "Material Icons"
                content: "\e872"
                font-size 24px
                margin-right 10px

</style>
