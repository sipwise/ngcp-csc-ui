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
                class="col col-xs-12 col-md-2 text-center"
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
                </div>

            </div>
        </div>
        <csc-cf-group
            v-for="forwardGroup in forwardGroups"
            key="forwardGroup.id"
            group="forwardGroup"
        />
<!--        <div-->
<!--            class="row csc-cf-destinations-cont"-->
<!--        >-->
<!--            <div-->
<!--                class="col col-xs-12 col-md-12"-->
<!--            >-->
<!--                <csc-new-call-forward-destination-->
<!--                    v-for="(destination, index) in destinations"-->
<!--                    :key="index"-->
<!--                    :index="index"-->
<!--                    :destination="destination"-->
<!--                />-->
<!--            </div>-->
<!--        </div>-->
<!--        <div-->
<!--            class="row"-->
<!--        >-->
<!--            <div-->
<!--                class="col col-xs-12 col-md-6"-->
<!--            >-->

<!--                <csc-new-call-forward-add-destination-form-->
<!--                    class="csc-list-form col-xs-12 col-md-4 col-lg-6"-->
<!--                    ref="addDestinationForm"-->
<!--                />-->
<!--            </div>-->
<!--        </div>-->
    </csc-page>
</template>


<script>
    import {
        mapState,
        mapGetters,
        mapMutations
    } from 'vuex'
    import {
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
            return {};
        },
        async mounted(){
            await this.$store.dispatch('newCallForward/loadDestinationsets');
            const unconditionalDestSet = await this.$store.dispatch('newCallForward/getDestinationSetByName', 'csc-unconditional');
            if(unconditionalDestSet){
                this.$store.dispatch('newCallForward/loadDestinations', unconditionalDestSet.destinations);
            }

        },
        computed: {
            ...mapState('newCallForward', [
                'forwardGroups'
            ]),
            ...mapGetters('newCallForward', [
                'primaryNumber',
                'subscriberDisplayName',
                'destinations'
            ]),
            primaryNumberEnabled(){
                return true;
            },
            toggleLabel(){
                return `${this.$t('pages.newCallForward.primarNumberEnabled')}`;
            }
        },
        methods: {
            ...mapMutations('newCallForward', [
                'addForward'
            ]),
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
</style>
