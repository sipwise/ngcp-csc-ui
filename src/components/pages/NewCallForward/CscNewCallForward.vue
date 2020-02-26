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
                <q-field
                    class="csc-form-field"
                >
                    <q-toggle
                        :label="toggleLabel"
                        :value="primaryNumberEnabled"
                        :left-label="true"
                        @input="togglePrimaryNumber()"

                    />
                </q-field>
            </div>
        </div>
        <div
            class="row"
        >
            <div
                class="col col-xs-12 col-md-6"
            >
                <q-btn

                />
                {{ $t('pages.newCallForward.forwardBtnLabel') }}
                </q-btn>
                <q-popover
                    ref="destinationType"
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
            class="row"
        >
            <div
                class="col col-xs-12 col-md-6"
            >
                <csc-new-call-forward-destination
                    v-for="destination in destinations"
                    :key="destination.announcement_id"
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
                    @save="addNumber"
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
        created() {},
        computed: {
            ...mapState('newCallForward', [

            ]),
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
            togglePrimaryNumber(){

            },
            showForm(){
                this.$refs.destinationType.close();
                this.$refs.addDestinationForm.add();
            },
            addNumber(){
                this.$refs.addDestinationForm.close();
                this.$store.commit('newCallForward/addDestination',
                    {
                        "announcement_id": null,
                        "destination": this.$refs.addDestinationForm.number,
                        "priority": 1,
                        "timeout": 10
                    }
                );
            },
            addVoicemail(){
                debugger
            }
        },
        watch: {}
    }
</script>

<style lang="stylus" rel="stylesheet/stylus">
</style>
