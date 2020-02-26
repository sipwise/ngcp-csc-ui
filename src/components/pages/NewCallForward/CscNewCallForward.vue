<template>
    <csc-page
        class="csc-simple-page"
    >
        <div
            class="row"
        >
            <div
                class="col col-xs-12 col-md-6"
            >
                <q-field>
                    <q-toggle
                        :label="toggleLabel"
                        :value="primaryNumberEnabled"
                        :left-label="true"
                        @input="togglePrimaryNumber()"

                    />
                </q-field>
                <q-btn flat class="csc-cf-flat-btn">
                    {{ $t('pages.newCallForward.forwardBtnLabel') }}
                </q-btn>
                <q-popover
                    ref="destinationType"
                    anchor="center right"
                >
                    <q-list
                        link
                        class="no-border"
                    >
                        <q-item>
                            <q-item-main
                                :label="this.$t('pages.newCallForward.numberLabel')"
                                @click="showForm()"
                            />
                        </q-item>
                        <q-item>
                            <q-item-main
                                :label="this.$t('pages.newCallForward.voiceMailLabel')"
                                @click="addVoicemail()"
                            />
                        </q-item>
                    </q-list>
                </q-popover>
            </div>
        </div>
        <div
            class="row csc-cf-destinations-cont"
        >
            <div
                class="col col-xs-12 col-md-6"
            >
                <csc-new-call-forward-destination
                    v-for="(destination, index) in destinations"
                    :index="index"
                    :destination="destination"
                />
            </div>
        </div>
        <div
            class="row"
        >
            <div
                class="col col-xs-12 col-md-6"
            >

                <csc-new-call-forward-add-destination-form
                    class="csc-list-form col-xs-12 col-md-4 col-lg-6"
                    ref="addDestinationForm"
                />
            </div>
        </div>
    </csc-page>
</template>


<script>
    import { mapState, mapGetters } from 'vuex'
    import {
        QField,
        QToggle,
        QBtn,
        QPopover,
        QList,
        QItem,
        QItemMain
    } from 'quasar-framework'
    import CscPage from '../../CscPage'
    import CscNewCallForwardDestination from './CscNewCallForwardDestination'
    import CscNewCallForwardAddDestinationForm from './CscNewCallForwardAddDestinationForm'
    export default {
        data () {
            return {};
        },
        components: {
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
        },
        computed: {
            ...mapState('newCallForward', []),
            ...mapGetters('newCallForward', [
                'subscriberDisplayName',
                'destinations'
            ]),
            primaryNumberEnabled(){
                return true;
            },
            toggleLabel(){
                return `${this.$t('pages.newCallForward.primarNumberEnabled')} ${this.subscriberDisplayName}`;
            }
        },
        methods: {
            togglePrimaryNumber(){},
            showForm(){
                this.$refs.destinationType.close();
                this.$refs.addDestinationForm.add();
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
</style>
