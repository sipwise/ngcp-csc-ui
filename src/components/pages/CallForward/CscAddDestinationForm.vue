<template>
    <div class="add-destination-form">
        <q-field v-if="!numberFormEnabled && !terminationFormEnabled">
            <q-btn flat color="primary" icon="fa-plus">
                {{ $t('pages.callForward.addDestinationButton') }}
                <q-popover ref="popover">
                    <q-list separator link>
                        <q-item @click="enableNumberForm(),
                            $refs.popover.close()">
                                {{ $t('pages.callForward.buttons.addNumber') }}
                        </q-item>
                        <q-item @click="enableTerminationForm('voicebox'),
                            $refs.popover.close()">
                                {{ $t('pages.callForward.buttons.addVoicemail') }}
                        </q-item>
                        <q-item @click="enableTerminationForm('fax2mail'),
                            $refs.popover.close()"
                            v-if="hasFaxEnabled">
                                {{ $t('pages.callForward.buttons.addFax2Mail') }}
                        </q-item>
                    </q-list>
                </q-popover>
            </q-btn>
        </q-field>
        <div v-if="numberFormEnabled">
            <q-field :error="addFormError"
                :error-label="$t('pages.callForward.addInputError')">
                    <p class="caption">
                        {{ $t('pages.callForward.number') }}
                    </p>
                    <q-input type="text" v-model="newNumber" clearable
                        @keyup.enter="addDestination('number')" autofocus />
                    <p class="caption">
                        {{ $t('pages.callForward.timeout') }}
                    </p>
                    <q-slider class="timeout-slider" v-model="newTimeout"
                        :min="0" :max="300" label-always />
            </q-field>
            <q-btn flat @click="disableNumberForm()">
                {{ $t('buttons.cancel') }}
            </q-btn>
            <q-btn flat color="primary" icon-right="fa-save"
                @click="addDestination('number')">
                    {{ $t('buttons.save') }}
            </q-btn>
        </div>
        <div v-if="voicemailFormEnabled">
            <q-input
                v-model="destinationTypeSelected"
                value="voicebox"
                disable
            />
            <q-btn flat @click="disableVoicemailForm()">
                {{ $t('buttons.cancel') }}
            </q-btn>
            <q-btn flat color="primary" icon-right="fa-save"
                @click="addDestination('voicemail')">
                {{ $t('buttons.save') }}
            </q-btn>
        </div>
        <div v-if="terminationFormEnabled">
            <q-select
                v-model="destinationTypeSelected"
                float-label="Destination Type"
                :options="destinationTypeOptions"
            />
            <q-btn flat @click="disableTerminationForm()">
                {{ $t('buttons.cancel') }}
            </q-btn>
            <q-btn flat color="primary" icon-right="fa-save"
                @click="addDestination('termination')">
                {{ $t('buttons.save') }}
            </q-btn>
        </div>
    </div>
</template>

<script>
    import { showToast } from '../../../helpers/ui'
    import { QItem, Toast, QBtn, QSelect, QPopover, QList,
        QField, QInput, QSlider } from 'quasar-framework'
    export default {
        name: 'csc-add-destination-form',
        props: [
            'destinations',
            'id',
            'groupName'
        ],
        data () {
            return {
                addFormError: false,
                numberFormEnabled: false,
                voicemailFormEnabled: false,
                terminationFormEnabled: false,
                newNumber: '',
                newTimeout: 300,
                destinationTypeSelected: '',
                destinationTypeOptions: [
                    {
                        label: 'Voicemail',
                        value: 'voicebox'
                    },
                    {
                        label: 'Fax2Mail',
                        value: 'fax2mail'
                    }
                ]
            }
        },
        components: {
            QSelect,
            QPopover,
            QField,
            QInput,
            QSlider,
            QList,
            QItem,
            Toast,
            QBtn
        },
        mounted() {
            this.$store.dispatch('callForward/setFaxCapability');
        },
        computed: {
            hasFaxEnabled() {
                return this.$store.state.callForward.hasFaxEnabled;
            },
            newPriority() {
                let newPriority;
                if (!this.destinations == null) {
                    this.destinations.forEach(function(destination) {
                        newPriority = (destination.priority > newPriority) ?
                        destination.priority : newPriority;
                    });
                } else {
                    newPriority = 1;
                }
                return newPriority;
            }
        },
        methods: {
            disableNumberForm() {
                this.numberFormEnabled = false;
                this.newNumber = '';
                this.newTimeout = 300;
            },
            enableNumberForm() {
                this.numberFormEnabled = true;
            },
            disableTerminationForm() {
                this.terminationFormEnabled = false;
                this.voicemailFormEnabled = false;
                this.destinationTypeSelected = '';
            },
            enableTerminationForm(type) {
                if (this.hasFaxEnabled) {
                    this.destinationTypeSelected = type;
                    this.terminationFormEnabled = true;
                } else {
                    this.destinationTypeSelected = 'Voicemail';
                    this.voicemailFormEnabled = true;
                };
            },
            addDestination(destinationType) {
                let clonedDestinations = _.cloneDeep(this.destinations);
                let destinationToAdd = destinationType === 'number' ?
                    this.newNumber : this.destinationTypeSelected;
                let self = this;
                let newDestinationset = (clonedDestinations == null) ? [] : clonedDestinations;
                if (destinationType === 'number') {
                    newDestinationset.push({
                        announcement_id: null,
                        destination: destinationToAdd,
                        priority: this.newPriority,
                        timeout: this.newTimeout
                    });
                } else if (destinationType === 'termination') {
                    newDestinationset.push({
                        announcement_id: null,
                        destination: destinationToAdd,
                        priority: this.newPriority
                    });
                } else if (destinationType === 'voicemail') {
                    newDestinationset.push({
                        announcement_id: null,
                        destination: 'voicebox',
                        priority: this.newPriority
                    });
                } else {
                    console.log('Wrong destination type used.');
                }
                if (this.destinations == null) {
                    this.$store.dispatch('callForward/addDestinationsetToEmptyGroup', {
                        data: newDestinationset, groupName: self.groupName }).then((result) => {
                            this.$store.dispatch('callForward/loadAlwaysEverybodyDestinations');
                        }).catch((err) => {
                            showToast(this.$t('pages.callForward.addErrorMessage'));
                        });
                } else {
                    this.$store.dispatch('callForward/addDestinationToDestinationset', {
                        id: this.id,
                        data: newDestinationset }).then((result) => {
                            this.$store.dispatch('callForward/loadAlwaysEverybodyDestinations');
                        }).catch((err) => {
                            showToast(this.$t('pages.callForward.addErrorMessage'));
                        });
                }
                destinationType === 'number' ? this.disableNumberForm()
                    : this.disableTerminationForm();
            }
        }
    }
</script>

<style lang="stylus">
@import '~variables'
.add-destination-form
    margin 10px 15px 0 15px
    .q-slider.label-always
        padding 15px 0 5px
        height 50px
</style>
