<template>
    <div>
        <q-item highlight v-for="(destination, index) in destinations">
            <q-item-main>
                <div class="dest-row">
                    <span v-if="index == 0">
                        {{ $t('pages.callForward.firstRing') }}
                    </span>
                    <span v-else-if="index > 0">
                        {{ $t('pages.callForward.thenRing') }}
                    </span>
                    <span class="dest-values">
                        {{ destination.destination | numberFormat }}
                    </span>
                    <span v-if="isNumber(destination.destination)">
                        <span>
                            {{ $t('pages.callForward.for') }}
                        </span>
                        <span class="dest-values">
                            {{ destination.timeout }}
                        </span>
                        <span>
                            {{ $t('pages.callForward.secs') }}
                        </span>
                    </span>
                </div>
            </q-item-main>
            <q-item-side right>
                <q-btn color="negative" flat icon="delete"
                    @click="deleteDestination(index)">
                        {{ $t('buttons.remove') }}
                </q-btn>
            </q-item-side>
        </q-item>
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
                            <q-item @click="enableTerminationForm('voicemail'),
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
                            @keyup.enter="addNumber()" autofocus />
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
                    @click="addNumber()">
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
                    @click="addTermination()">
                    {{ $t('buttons.save') }}
                </q-btn>
            </div>
        </div>
    </div>
</template>

<script>
    import numberFormat from '../../../filters/number-format'
    import _ from 'lodash'
    import { showToast } from '../../../helpers/ui'
    import { QItem, QItemSide, Dialog, Toast, QBtn,
        QSelect, QItemMain, QPopover, QList,
        QField, QInput, QSlider } from 'quasar-framework'
    export default {
        name: 'csc-destination',
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
						value: 'voicemail'
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
            QItem,
            QItemMain,
            QItemSide,
            QSelect,
            QPopover,
            QList,
            QField,
            QInput,
            QSlider,
            Dialog,
            Toast,
            QBtn
        },
        computed: {
        },
        methods: {
            disableNumberForm() {
                this.numberFormEnabled = false;
            },
            enableNumberForm() {
                this.numberFormEnabled = true;
            },
            disableTerminationForm() {
                this.destinationTypeSelected = '';
                this.terminationFormEnabled = false;
            },
            enableTerminationForm(type) {
                this.destinationTypeSelected = type;
                this.terminationFormEnabled = true;
            },
            addTermination() {
                console.log('addTermination()');
            },
            addNumber() {
                console.log('addNumber()');
            },
            isNumber(destination) {
                let dest = destination.split(/:|@/);
                return !isNaN(dest[1]);
            },
            deleteDestination(index) {
                let clonedDestinations = _.cloneDeep(this.destinations);
                let indexInt = parseInt(index);
                let store = this.$store;
                let removeDestination = numberFormat(this.destinations[index].destination);
                let self = this;
                let isLastDestination = this.destinations.length === 1;
                clonedDestinations.splice(indexInt, 1);
                Dialog.create({
                    title: self.$t('pages.callForward.removeDialogTitle'),
                    message: self.$t('pages.callForward.removeDialogText', {
                        destination: removeDestination
                    }),
                    buttons: [
                        self.$t('buttons.cancel'),
                        {
                            label: self.$t('buttons.remove'),
                            color: 'negative',
                            handler () {
                                store.dispatch('callForward/deleteDestinationFromDestinationset', {
                                    id: self.destinationsetId,
                                    data: clonedDestinations,
                                    deleteDestinationset: isLastDestination }).then((result) => {
                                        store.dispatch('callForward/loadAlwaysEverybodyDestinations');
                                        showToast(self.$t('pages.callForward.removeSuccessMessage', {
                                            destination: removeDestination
                                        }));
                                    }).catch((err) => {
                                        showToast(self.$t('pages.callForward.removeErrorMessage'));
                                    });
                            }
                        }
                    ]
                });
            }
        }
    }
</script>

<style lang="stylus">
@import '~variables'
.dest-row
    display inline-block
    width 90%
    .dest-values
        font-weight 500
.add-destination-form
    margin 10px 15px 0 15px
div.add-destination-form > div > div > div > div > div.q-slider.non-selectable.timeout-slider.label-always
    padding 15px 0 5px
    height 50px
</style>
