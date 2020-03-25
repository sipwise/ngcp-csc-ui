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
            ></div>
        </div>
        <div class="csc-cf-row row">
            <div
                class="column col col-xs-12 col-md-4 items-end"
            >

                <div
                    class="csc-text-action"
                    @click="addForward"
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
                </div>

            </div>
        </div>
        <div
            class="csc-cf-row row"
            v-for="(forwardGroup, item) in forwardGroups"
            :key="forwardGroup.id"
        >
            <csc-cf-group
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
    import CscCfGroup from "./CscCallForwardGroup";
    export default {
        components: {
            CscCfGroup,
            CscPage,
            CscNewCallForwardDestination,
            CscNewCallForwardAddDestinationForm,
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
                groupsLoading: false
            };
        },
        async mounted(){
            this.groupsLoading = true;
            await this.$store.dispatch('newCallForward/loadForwardGroups');
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
                return `${this.$t('pages.newCallForward.primarNumberEnabled')}`;
            }
        },
        methods: {
            async addForward(){
                this.groupInCreation = true;
                const unconditionalFwdGroup = await this.$store.dispatch('newCallForward/getForwardGroupByName', 'unconditional');
                if(!unconditionalFwdGroup){
                    await this.$store.dispatch('newCallForward/addForwardGroup', 'unconditional');
                    await this.$store.dispatch('newCallForward/loadForwardGroups');
                }
                this.groupInCreation = false;
            },
            togglePrimaryNumber(){},
            showForm(){
                this.$refs.destinationType.close();
                this.$refs.addDestinationForm.add();
            },
            addVoicemail(){},
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
