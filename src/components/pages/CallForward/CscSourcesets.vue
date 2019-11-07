<template>
    <q-tabs
        v-model="tab"
        no-pane-border
        inverted
        class="sourceset-tabs"
    >
        <q-tab
            v-for="(sourceset, index) in destinations"
            :default="index === 0"
            :count="destinationsCount(sourceset.destinationGroups)"
            :key="sourceset.sourcesetId || 0"
            :name="sourceset.sourcesetName || $t('pages.callForward.everyCaller')"
            :label="sourceset.sourcesetName || $t('pages.callForward.everyCaller')"
            icon="people"
            slot="title"
        />
        <q-tab
            slot="title"
            :label="$t('buttons.addNew')"
            name="addnew"
            icon="add"
        />
        <q-tab-pane
            v-for="sourceset in destinations"
            :key="sourceset.sourcesetId || 0"
            :name="sourceset.sourcesetName || $t('pages.callForward.everyCaller')"
            class="sourceset-pane"
        >
            <div
                class="sources-section"
                v-if="sourceset.sourcesetId"
            >
                <div class="sourceset-delete row justify-end">
                    <q-btn
                        flat
                        align="right"
                        color="negative"
                        icon="delete"
                        class="add-destination-button sourceset-delete"
                        :class="{ 'no-padding': $q.platform.is.mobile, 'mobile-button': $q.platform.is.mobile }"
                        @click="removeSourceset(sourceset)"
                    >
                        {{ deleteSourcesetLabel }}
                    </q-btn>
                </div>
                <div class="sources-title">
                    <q-icon
                        name="contact_phone"
                        class="sources-icon"
                    />
                    {{ $t('pages.callForward.sources.sourcesTitleMode',
                        { mode: capitalizedMode(sourceset.sourcesetMode) }) }}
                </div>
                <q-list
                    no-border
                    striped-odd
                >
                    <q-item
                        highlight
                        separator
                        v-for="(source, index) in sourcesetSources(sourceset.sourcesetId)"
                        class="source-item" :key="index">
                        <q-item-main>
                        {{ source.source }}
                        </q-item-main>
                        <q-item-side
                            right
                            icon="delete"
                            color="negative"
                            @click="removeSource(sourceset, source.source, index)"
                        />
                    </q-item>
                </q-list>
                <q-btn
                    v-if="!sourcesetsFormEnabled"
                    flat
                    color="primary"
                    icon="add"
                    @click="openForm()"
                >
                    {{ $t('pages.callForward.sources.addSourceButton') }}
                </q-btn>
                <csc-sourcesets-form
                    v-if="sourcesetsFormEnabled"
                    :sourceset-id="sourceset.sourcesetId"
                    :form-enabled="addSourceFormEnabled"
                    @add-source="addSource"
                    @source-form-close="closeForm"
                    ref="sourcesetsForm"
                />
            </div>
            <csc-call-forward-destinations
                :sourceset="sourceset.sourcesetId"
                :timeset="timesetName"
                :destinations="sourceset.destinationGroups"
            />
        </q-tab-pane>
        <q-tab-pane name="addnew">
            <q-list no-border>
                <q-item>
                    <q-item-main>
                        <q-item-tile class="row no-wrap">
                            <q-input
                                dark
                                autofocus
                                class="col"
                                v-model="sourcesetName"
                                :float-label="$t('pages.callForward.sources.sourceset')"
                                color="primary"
                                @keyup.enter="addSourceset()" />
                            <q-input
                                dark
                                class="col"
                                v-model="source"
                                :float-label="$t('pages.callForward.sources.source')"
                                color="primary"
                                @keyup.enter="addSourceset()" />
                            <q-select
                                dark
                                v-model="mode"
                                :options="modes"
                                color="primary"
                                class="col"
                                align="right" />
                        </q-item-tile>
                        <q-item-tile>
                            <q-btn
                                flat
                                icon="check"
                                color="primary"
                                @click="addSourceset()"
                                :disable="!isValid"
                                class="sourceset-add-button">
                                    {{ $t('buttons.save') }}
                            </q-btn>
                        </q-item-tile>
                    </q-item-main>
                </q-item>
            </q-list>
        </q-tab-pane>
    </q-tabs>
</template>

<script>
    import CscCallForwardDestinations from './CscCallForwardDestinations'
    import CscSourcesetsForm from './CscSourcesetsForm'
    import { mapGetters } from 'vuex'
    import {
        startLoading,
        stopLoading,
        showGlobalError,
        showToast
    } from '../../../helpers/ui'
    import {
        QTabs,
        QTab,
        QTabPane,
        QList,
        QItem,
        QItemMain,
        QItemTile,
        QItemSide,
        QInput,
        QIcon,
        QSelect,
        QBtn,
        Dialog,
        Alert
    } from 'quasar-framework'
    import 'quasar-extras/animate/bounceInRight.css'
    import 'quasar-extras/animate/bounceOutRight.css'
    export default {
        name: 'csc-sourcesets',
        props: {
            destinations: Array,
            sourcesets: Array,
            timesetName: [String, Object]
        },
        data() {
            return {
                sourcesetName: '',
                source: '',
                mode: 'whitelist',
                modes: [
                    {
                        label: this.$t('pages.callForward.whitelist'),
                        value: 'whitelist'
                    },
                    {
                        label: this.$t('pages.callForward.blacklist'),
                        value: 'blacklist'
                    }
                ],
                tab: this.$t('pages.callForward.everyCaller'),
                sourcesetsFormEnabled: false
            }
        },
        components: {
            CscCallForwardDestinations,
            CscSourcesetsForm,
            QTabs,
            QTab,
            QTabPane,
            QList,
            QItem,
            QItemMain,
            QItemTile,
            QItemSide,
            QInput,
            QIcon,
            QSelect,
            QBtn
        },
        computed: {
            ...mapGetters('callForward', [
                'addSourceState',
                'addSourceError',
                'lastAddedSource',
                'addSourceFormEnabled',
                'removeSourcesetError',
                'removeSourcesetState',
                'lastRemovedSourceset',
                'removeSourceState',
                'removeSourceError',
                'lastRemovedSource'
            ]),
            isValid() {
                return this.source.length > 0 && this.sourcesetName.length > 0;
            },
            deleteSourcesetLabel() {
                return this.$q.platform.is.mobile ? '' :
                    this.$t('pages.callForward.sources.removeSourcesetButton');
            }
        },
        methods: {
            removeSource(sourceset, source, index) {
                let self = this;
                let sources = this.sourcesetSources(sourceset.sourcesetId);
                let isLastSource = sources.length === 1;
                if (isLastSource) {
                    this.alertDeleteLastSource();
                }
                else {
                    Dialog.create({
                        title: self.$t('pages.callForward.sources.removeSourceDialogTitle'),
                        message: self.$t('pages.callForward.sources.removeSourceDialogText', {
                            source: source
                        }),
                        buttons: [
                            self.$t('buttons.cancel'),
                            {
                                label: self.$t('buttons.remove'),
                                color: 'negative',
                                handler () {
                                    self.$store.dispatch('callForward/deleteSourceFromSourcesetByIndex', {
                                        sourceset: sourceset,
                                        sources: sources,
                                        sourceIndex: index
                                    });
                                }
                            }
                        ]
                    });
                }
            },
            alertDeleteLastSource() {
                Alert.create({
                    enter: 'bounceInRight',
                    leave: 'bounceOutRight',
                    position: 'top-center',
                    html: this.$t('pages.callForward.sources.removeLastSourceDialogText'),
                    icon: 'warning',
                    dismissible: true
                });
            },
            capitalizedMode(mode) {
                return `${mode.charAt(0).toUpperCase()}${mode.slice(1)}`;
            },
            resetForm() {
                this.source = '';
                this.sourcesetName = '';
                this.mode = 'whitelist';
                this.tab = this.$t('pages.callForward.everyCaller');
            },
            sourcesetSources(id) {
                let sourceset = this.sourcesets.filter((sourceset) => {
                    return sourceset.id === id;
                })[0];
                if (this.sourcesets[0] && sourceset) {
                    return sourceset.sources;
                }
                else {
                    return [];
                }
            },
            destinationsCount(groups) {
                let groupCollection = [
                    { name: 'busy', length: 0 },
                    { name: 'offline', length: 0 },
                    { name: 'online', length: 0 }
                ];
                groupCollection.forEach((group) => {
                    if (groups[group.name].length > 0) {
                        let count = 0;
                        groups[group.name].forEach((destinationSet) => {
                            count += destinationSet.destinations.length;
                        });
                        group.length = count;
                    }
                });
                return groupCollection[0].length + groupCollection[1].length + groupCollection[2].length;
            },
            tabId(id) {
                return id === null ? 0 : id;
            },
            tabName(name) {
                return name === null ? 'Everybody' : name;
            },
            addSourceset() {
                if (this.isValid) {
                    this.$store.dispatch('callForward/createSourcesetWithSource', {
                        sourcesetName: this.sourcesetName,
                        source: this.source,
                        mode: this.mode
                    });
                }
                else {
                    showGlobalError(this.$t('pages.callForward.sources.fieldMissing'));
                }
            },
            openForm() {
                this.sourcesetsFormEnabled = true;
            },
            closeForm() {
                this.$refs.sourcesetsForm[0].resetForm();
                this.sourcesetsFormEnabled = false;
            },
            addSource(options) {
                this.$store.dispatch('callForward/appendSourceToSourceset', options);
            },
            removeSourceset(sourceset) {
                let self = this;
                Dialog.create({
                    title: self.$t('pages.callForward.sources.removeSourcesetDialogTitle'),
                    message: self.$t('pages.callForward.sources.removeSourcesetDialogText', {
                        sourceset: sourceset.sourcesetName
                    }),
                    buttons: [
                        self.$t('buttons.cancel'),
                        {
                            label: self.$t('buttons.remove'),
                            color: 'negative',
                            handler () {
                                self.$store.dispatch('callForward/deleteSourcesetById', sourceset);
                            }
                        }
                    ]
                });
            },
            loadDestinations() {
                this.$store.dispatch('callForward/loadDestinations', {
                    timeset: this.timesetName
                });
            },
            loadAll() {
                this.loadDestinations();
                this.$store.dispatch('callForward/loadSourcesets');
            }
        },
        watch: {
            addSourceState(state) {
                if (state === 'requesting') {
                    startLoading();
                }
                else if (state === 'failed') {
                    stopLoading();
                    showGlobalError(this.addSourceError);
                }
                else if (state === 'succeeded') {
                    stopLoading();
                    showToast(this.$t('pages.callForward.sources.addSourceSuccessMessage', {
                        source: this.lastAddedSource
                    }));
                    this.$store.dispatch('callForward/loadSourcesets');
                    this.loadDestinations();
                    this.closeForm();
                }

            },
            removeSourcesetState(state) {
                if (state === 'requesting') {
                    startLoading;
                }
                else if (state === 'failed') {
                    stopLoading;
                    showGlobalError(this.removeSourcesetError);
                }
                else if (state === 'succeeded') {
                    stopLoading;
                    showToast(this.$t('pages.callForward.sources.removeSourcesetSuccessMessage', {
                        sourceset: this.lastRemovedSourceset
                    }));
                    this.loadAll();
                    this.resetForm();
                }
            },
            removeSourceState(state) {
                if (state === 'requesting') {
                    startLoading();
                }
                else if (state === 'failed') {
                    stopLoading();
                    showGlobalError(this.removeSourceError);
                }
                else if (state === 'succeeded') {
                    stopLoading();
                    showToast(this.$t('pages.callForward.sources.removeSourceSuccessMessage', {
                        source: this.lastRemovedSource
                    }));
                    this.loadAll();
                }
            }
        }
    }
</script>

<style lang="stylus" rel="stylesheet/stylus">
    @import '../../../themes/quasar.variables.styl'

    .q-item-highlight.source-item:hover
        background-color $item-highlight-color

    .sourceset-tabs

        .q-tab-pane
            padding 12px 0 0 0

    .sourceset-add-button
        margin-top 8px

    .sources-section
        padding 0 0 20px 0

        .mobile-button > span > i
            margin 0

    .sources-title
        color $secondary
        font-size 16px

    .sources-icon
        margin-right 5px

</style>
