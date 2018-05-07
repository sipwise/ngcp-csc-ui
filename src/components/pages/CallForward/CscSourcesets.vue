<template>
    <q-tabs no-pane-border inverted>
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
        <q-tab-pane
            v-for="sourceset in destinations"
            :key="sourceset.sourcesetId || 0"
            :name="sourceset.sourcesetName || 'Everybody'"
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
                        {{ $t('pages.callForward.titles.sources') }}
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
                <csc-sourcesets-form
                    :sourceset-id="sourceset.sourcesetId"
                    :form-enabled="addSourceFormEnabled"
                    @source-form-open="openForm"
                    @source-form-close="closeForm"
                />
            </div>
            <csc-call-forward-destinations
                :sourceset="sourceset.sourcesetId"
                :timeset="timesetName"
                :destinations="sourceset.destinationGroups"
            />
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
        QIcon
    } from 'quasar-framework'
    export default {
        name: 'csc-sourcesets',
        props: {
            destinations: Object,
            sourcesets: Object,
            timesetName: [String, Object]
        },
        components: {
            CscCallForwardDestinations,
            CscSourcesetsForm,
            QTabs,
            QTab,
            QTabPane,
            QList,
            QItem,
            QIcon
        },
        computed: {
            ...mapGetters('callForward', [
                'addSourceState',
                'addSourceError',
                'lastAddedSource',
                'addSourceFormEnabled'
            ])
        },
        methods: {
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
            openForm() {
                this.$store.commit('callForward/setAddSourceFormEnabled', true);
            },
            closeForm() {
                this.$store.commit('callForward/setAddSourceFormEnabled', false);
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

    .sources-section
        padding 30px 0 20px 0

    .sources-title
        color $secondary
        font-size 16px

    .sources-icon
        margin-right 5px

    .source-field
        width 100%

</style>
