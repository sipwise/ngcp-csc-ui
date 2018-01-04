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
                            $refs.popover.close()">
                                {{ $t('pages.callForward.buttons.addFax2Mail') }}
                        </q-item>
                        <q-item @click="enableTerminationForm('conference'),
                            $refs.popover.close()">
                                {{ $t('pages.callForward.buttons.addConference') }}
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
    import { QCardTitle, QCardMain, QItem, QItemSide,
        Toast, QBtn, QSelect, QItemMain, QPopover, QList,
        QIcon, QField, QInput, QSlider, Dialog } from 'quasar-framework'
    export default {
        name: 'csc-add-destination-form',
        props: [
            'destinations',
            'destinationsetId'
        ],
        data () {
            return {
                addFormError: false,
                numberFormEnabled: false,
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
                    },
                    {
                        label: 'Conference',
                        value: 'conference'
                    }
                ]
            }
        },
        components: {
            QCardTitle,
            QCardMain,
            QSelect,
            QPopover,
            QList,
            QField,
            QInput,
            QSlider,
            QList,
            QItem,
            QIcon,
            Dialog,
            Toast,
            QBtn
        },
        computed: {
            newPriority() {
                let newPriority = 1;
                console.log('this.destinations', this.destinations);
                this.destinations.forEach(function(destination) {
                    newPriority = (destination.priority > newPriority) ? destination.priority : newPriority;
                });
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
                this.destinationTypeSelected = '';
            },
            enableTerminationForm(type) {
                this.destinationTypeSelected = type;
                this.terminationFormEnabled = true;
            },
            addDestination(destinationType) {
                let clonedDestinations = _.cloneDeep(this.destinations);
                let destinationToAdd = destinationType === 'number' ?
                    this.newNumber : this.destinationTypeSelected;
				let self = this;
                if (destinationType === 'number') {
                    clonedDestinations.push({
                        announcement_id: null,
                        destination: destinationToAdd,
                        priority: this.newPriority,
                        timeout: this.newTimeout
                    });
                } else if (destinationType === 'termination') {
                    clonedDestinations.push({
                        announcement_id: null,
                        destination: destinationToAdd,
                        priority: this.newPriority
                    });
                } else {
                    console.log('Wrong destination type used.');
                }
                this.$store.dispatch('callForward/deleteDestinationFromDestinationset', {
                    id: this.destinationsetId,
                    data: clonedDestinations }).then((result) => {
                        this.$store.dispatch('callForward/loadAlwaysEverybodyDestinations');
                    }).catch((err) => {
                        showToast(this.$t('pages.callForward.addErrorMessage'));
                    });
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
