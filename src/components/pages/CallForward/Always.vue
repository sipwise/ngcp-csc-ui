<template>
    <csc-page :title="$t('pages.callForward.titles.always')">
        <q-card class="sourceset-card">
            <q-card-title class="dest-title">
                {{ $t('pages.callForward.forCallingParties') }}
            </q-card-title>
            <q-card-main>
				<!--TODO: 1. Adjust spacing between sources-->
				<!--TODO: 2. Implement "edit via input field", modeled on callblocking-->
				<!--TODO: 3. Add "ADD SOURCE" and "EDIT TITLE" buttons-->
				<q-card class="source-card" flat
					v-for="(item, index) in sources"
					v-key="item.source">
					<q-card-title>
						<span v-if="!(editing && editingIndex == index)"
							@click="editSource(index)">
								{{ item.source | numberFormat }}
						</span>
						<q-input autofocus
							v-if="editing && editingIndex == index"
							type="text"
							float-label="Source"
							v-model="editingSource"
							@keyup.enter="saveSource(index)" />
						<q-btn flat v-if="editing && editingIndex == index"
							color="primary"
							icon="fa-save"
							slot="right"
							@click="saveSource(index)">
								{{ $t('buttons.save') }}
						</q-btn>
						<q-btn flat v-if="editing && editingIndex == index"
							icon="clear"
							slot="right"
							@click="saveSource(index)">
								{{ $t('buttons.cancel') }}
						</q-btn>
						<q-btn flat v-if="!(editing && editingIndex == index)"
							color="primary"
							icon="fa-edit"
							slot="right"
							@click="editSource(index)">
								{{ $t('buttons.edit') }}
						</q-btn>
						<q-btn flat v-if="!(editing && editingIndex == index)"
							color="negative"
i							icon="delete"
							slot="right"
							@click="deleteSource(index)">
								{{ $t('buttons.remove') }}
						</q-btn>
					</q-card-title>
				</q-card>
                <q-field v-if="addSourceFormEnabled" :error="addSourceFormError" :error-label="$t('pages.callForward.addSourceInputError')">
                    <q-input autofocus v-if="!(editing && editingIndex == index)" type="text" float-label="Source" v-model="newSource" @keyup.enter="addSource()" />
                    <q-btn flat @click="disableAddSourceForm()">{{ $t('buttons.cancel') }}</q-btn>
                    <q-btn flat color="primary" icon-right="fa-save" @click="addSource()">{{ $t('buttons.save') }}</q-btn>
                </q-field>
            </q-card-main>
            <q-card-actions>
                <q-btn v-if="!addSourceFormEnabled" color="primary"
                   icon="fa-plus" flat
                   @click="enableAddSourceForm()">
                        {{ $t('pages.callForward.addSourceButton') }}
                </q-btn>
                <q-btn color="primary"
                   icon="fa-plus" flat
                   @click="enableChangeTitleForm()">
                        {{ $t('pages.callForward.changeTitleButton') }}
                </q-btn>
            </q-card-actions>
        </q-card>
        <q-card class="dest-card">
            <csc-destinations :title="$t('pages.callForward.whenOnline')"
                :group="destinations.online"
                icon="signal_wifi_4_bar">
            </csc-destinations>
            <csc-destinations :title="$t('pages.callForward.whenBusy')"
                :group="destinations.busy"
                icon="record_voice_over">
            </csc-destinations>
            <csc-destinations :title="$t('pages.callForward.whenOffline')"
                :group="destinations.offline"
                icon="signal_wifi_off">
            </csc-destinations>
        </q-card>
    </csc-page>
</template>

<script>
    import numberFormat from '../../../filters/number-format'
    import CscPage from '../../CscPage'
    import CscDestinations from './CscDestinations'
    import { QCard, QCardMain, QCardTitle, QList,
        QItem, QItemSide, QItemMain, QBtn, QInput,
        QCardActions, Dialog, QTabs, QTabPane } from 'quasar-framework'
    export default {
        mounted() {
            this.$store.dispatch('callForward/loadAlwaysEverybodyDestinations');
        },
        data () {
            return {
                sources: [
                    { source: "43993006" },
                    { source: "11656143" },
                    { source: "33442211" },
                    { source: "43806401" },
                    { source: "11656142" },
                    { source: "55556663" }
                ],
                changeFormEnabled: false,
                changeFormError: null,
                addSourceFormEnabled: false,
                addSourceFormError: null,
                newSource: '',
                editing: false,
                editingIndex: 0,
                editingSource: ''
            }
        },
        components: {
            QCard,
            QCardMain,
            QCardTitle,
            QList,
            QItem,
            QItemSide,
            QItemMain,
            QBtn,
			QInput,
            QCardActions,
			Dialog,
			QTabs,
			QTabPane,
            CscPage,
            CscDestinations
        },
        methods: {
            disableAddSourceForm() {
                this.addSourceFormEnabled = false;
            },
            deleteSource(index) {
                console.log('deleteSource()');
				let removeSource = numberFormat(this.sources[index].source);
				let self = this;
				Dialog.create({
                    title: self.$t('pages.callForward.removeSourceDialogTitle'),
                    message: self.$t('pages.callForward.removeSourceDialogText', {
                        source: removeSource
                    }),
                    buttons: [
                        self.$t('buttons.cancel'),
						{
							label: self.$t('buttons.remove'),
                            color: 'negative'
						}
                    ]
				});
            },
            enableAddSourceForm() {
            	console.log('enableAddSourcesetForm()');
                this.addSourceFormEnabled = true;
                this.newSource = '';
                this.addSourceFormError = false;
            },
            disableAddSourceForm() {
                this.changeFormEnabled = false;
            },
            enableChangeTitleForm() {
                console.log('enableChangeTitleForm()');
            },
            addSource() {
				console.log('addSource()');
                this.editing = false;
            },
            editSource(index) {
                this.editing = true;
                this.editingIndex = index;
                this.editingSource = this.sources[index].source;
            },
            saveSource(index) {
                this.editing = false;
                this.editingIndex = index;
            }
        },
        computed: {
            destinations() {
                return this.$store.state.callForward.alwaysEverybodyDestinations;
            }
        }
    }
</script>

<style lang="stylus">
.sourceset-card
    .dest-title
        padding 20px 15px
    .q-item
        padding 0 15px
    .q-list
        margin-bottom 0
    .q-card-actions
        padding-bottom 20px
	.q-card-main
		.q-card-container
			padding 0 0 0 15px
		.q-card
			margin 0
</style>
