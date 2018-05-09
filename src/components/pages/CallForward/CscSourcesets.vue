<template>
    <q-tabs v-model="tab" no-pane-border inverted class="sourceset-tabs">
        <q-tab v-for="(sourceset, index) in destinations" :default="index === 0"
            :count="destinationsCount(sourceset.destinationGroups)"
            :key="sourceset.sourcesetId || 0" slot="title"
            :name="sourceset.sourcesetName || 'Everybody'" icon="people"
            :label="sourceset.sourcesetName || 'Everybody'" />
        <q-tab slot="title" label="Add new" name="addnew" icon="fa-plus" />
        <q-tab-pane v-for="sourceset in destinations"
            :key="sourceset.sourcesetId || 0"
            :name="sourceset.sourcesetName || 'Everybody'" class="sourceset-pane">
                <div class="sources-section" v-if="sourceset.sourcesetId">
                    <q-btn
                        flat
                        align="right"
                        color="negative"
                        icon="fa-plus"
                        class="add-destination-button"
                        @click="removeSourceset(sourceset)"
                    >
                        {{ $t('pages.callForward.sources.removeSourcesetButton') }}
                    </q-btn>
                    <div class="sources-title">
                        <q-icon name="contact_phone" class="sources-icon" />
                            {{ $t('pages.callForward.sources.sourcesTitleMode',
                                { mode: capitalizedMode(sourceset.sourcesetMode) }) }}
                    </div>
                    <q-list no-border>
                        <q-item highlight separator
                            v-for="source in sourcesetSources(sourceset.sourcesetId)"
                            class="source-item">
                            {{ source.source }}
                        </q-item>
                    </q-list>
                </div>
                <csc-call-forward-destinations
                    :sourceset="sourceset.sourcesetId"
                    :timeset="timesetName"
                    :destinations="sourceset.destinationGroups" />
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
    import { mapGetters } from 'vuex'
    import {
        startLoading,
        stopLoading,
        showToast,
        showGlobalError
    } from '../../../helpers/ui'
    import {
        QTabs,
        QTab,
        QTabPane,
        QBtn,
        QList,
        QItem,
        QItemMain,
        QItemTile,
        QInput,
        QIcon,
        QSelect,
        Dialog
    } from 'quasar-framework'
    export default {
        name: 'csc-sourcesets',
        props: [
            'destinations',
            'sourcesets',
            'timesetName'
        ],
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
                tab: 'Everybody'
            }
        },
        components: {
            CscCallForwardDestinations,
            QTabs,
            QTab,
            QTabPane,
            QBtn,
            QList,
            QItem,
            QItemMain,
            QItemTile,
            QInput,
            QIcon,
            QSelect,
            Dialog
        },
        computed: {
            ...mapGetters('callForward', [
                'removeSourcesetError',
                'removeSourcesetState'
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
                if (this.sourcesets[0]) {
                    return this.sourcesets.filter((sourceset) => {
                        return sourceset.id === id;
                    })[0].sources;
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
            }
        },
        watch: {
            removeSourcesetState(state) {
                if (state === 'requesting') {
                    startLoading;
                }
                else if (state === 'failed') {
                    stopLoading;
                    showGlobalError('failed');
                }
                else if (state === 'succeeded') {
                    stopLoading;
                    showToast('succeeded');
                    this.$store.dispatch('callForward/loadDestinations', {
                        timeset: null
                    });
                    this.$store.dispatch('callForward/loadSourcesets');
                    this.resetForm();
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

</style>
