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
            :name="sourceset.sourcesetName || 'Everybody'"
            :label="sourceset.sourcesetName || 'Everybody'"
            icon="people"
            slot="title"
        />
        <q-tab
            slot="title"
            label="Add new"
            name="addnew"
            icon="fa-plus"
        />
        <q-tab-pane
            v-for="sourceset in destinations"
            :key="sourceset.sourcesetId || 0"
            :name="sourceset.sourcesetName || 'Everybody'"
            class="sourceset-pane"
        >
            <div
                class="sources-section"
                v-if="sourceset.sourcesetId"
            >
                <div class="sources-title">
                    <q-icon
                        name="contact_phone"
                        class="sources-icon"
                    />
                        {{ $t('pages.callForward.sources.sourcesTitleMode',
                            { mode: capitalizedMode(sourceset.sourcesetMode) }) }}
                </div>
                <q-list no-border>
                    <q-item
                        v-for="source in sourcesetSources(sourceset.sourcesetId)"
                        class="source-item"
                        highlight
                        separator
                    >
                        {{ source.source }}
                    </q-item>
                </q-list>
                <q-btn
                    v-if="!formEnabled"
                    flat
                    color="primary"
                    icon="fa-plus"
                    @click="openForm()"
                >
                    {{ $t('pages.callForward.sources.addSourceButton') }}
                </q-btn>
                <csc-sourcesets-form
                    v-if="formEnabled"
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
                                autofocus
                                class="col"
                                v-model="sourcesetName"
                                :float-label="$t('pages.callForward.sources.sourceset')"
                                color="primary"
                                @keyup.enter="addSourceset()" />
                            <q-input
                                class="col"
                                v-model="source"
                                :float-label="$t('pages.callForward.sources.source')"
                                color="primary"
                                @keyup.enter="addSourceset()" />
                            <q-select
                                v-model="mode"
                                :options="modes"
                                color="primary"
                                class="col"
                                align="right" />
                        </q-item-tile>
                        <q-item-tile>
                            <q-btn
                                flat
                                color="primary"
                                icon-right="fa-save"
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
        QInput,
        QIcon,
        QSelect,
        QBtn
    } from 'quasar-framework'
    export default {
        name: 'csc-sourcesets',
        props: {
            destinations: Object,
            sourcesets: Object,
            timesetName: [String, Object]
        },
        data() {
            return {
                sourcesetName: '',
                source: '',
                mode: 'whitelist',
                modes: [
                    {
                        label: 'Whitelist',
                        value: 'whitelist'
                    },
                    {
                        label: 'Blacklist',
                        value: 'blacklist'
                    }
                ],
                tab: 'Everybody',
                formEnabled: false
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
                'addSourceFormEnabled'
            ]),
            isValid() {
                return this.source.length > 0 && this.sourcesetName.length > 0;
            }
        },
        methods: {
            capitalizedMode(mode) {
                return `${mode.charAt(0).toUpperCase()}${mode.slice(1)}`;
            },
            resetForm() {
                this.source = '';
                this.sourcesetName = '';
                this.mode = 'whitelist';
                this.tab = 'Everybody';
            },
            sourcesetSources(id) {
                return this.sourcesets.filter((sourceset) => {
                    return sourceset.id === id;
                })[0].sources;
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
                this.formEnabled = true;
            },
            closeForm() {
                this.$refs.sourcesetsForm[0].resetForm();
                this.formEnabled = false;
            },
            addSource(options) {
                this.$store.dispatch('callForward/appendSourceToSourceset', options);
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
                    this.$store.dispatch('callForward/loadDestinations', {
                        timeset: this.timesetName
                    });
                    this.closeForm();
                }
            }
        }
    }
</script>

<style lang="stylus" rel="stylesheet/stylus">
    @import '../../../themes/quasar.variables.styl'

    .q-item-highlight.source-item:hover
        background-color lighten($primary, 70%)

    .q-item.source-item
        padding 0

    .sourceset-tabs

        .q-tab-pane
            padding 12px 0 0 0

            .q-item
                padding 8px 0 0 0

    .sourceset-add-button
        margin-top 8px

    .sources-section
        padding 30px 0 20px 0

    .sources-title
        color $secondary
        font-size 16px

    .sources-icon
        margin-right 5px

</style>
