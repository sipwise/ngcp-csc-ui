<template>
    <csc-page :title="$t('pages.callForward.titles.always')">
        <q-tabs>
            <q-tab default slot="title" name="Everybody" icon="people" label="Everybody" />
            <q-tab v-for="sourceset in namedDestinations" :count="destinationsCount(sourceset.destinationGroups)" :key="sourceset.sourcesetId" slot="title" :name="sourceset.sourcesetName" icon="people" :label="sourceset.sourcesetName" />
            <q-tab-pane name="Everybody">
                <csc-call-forward-destinations :timeset="alwaysTimeset" :destinations="everybodySourceset.destinationGroups" />
            </q-tab-pane>
            <q-tab-pane v-for="sourceset in namedDestinations" :key="sourceset.sourcesetId" :name="sourceset.sourcesetName">
                <div class="sources-section">
                    <div class="sources-title">
                        <q-icon name="contact_phone" class="sources-icon" />
                        Sources
                    </div>
                    <q-list no-border>
                        <q-item highlight separator v-for="source in sourcesetSources(sourceset.sourcesetId)">
                            {{ source.source }}
                        </q-item>
                    </q-list>
                </div>
                <csc-call-forward-destinations :timeset="alwaysTimeset" :destinations="sourceset.destinationGroups" />
            </q-tab-pane>
        </q-tabs>
        <!--<q-btn @click="getState()">-->
            <!--LOG STATE-->
        <!--</q-btn>-->
    </csc-page>
</template>

<script>
    import { mapState } from 'vuex'
    import { QTabs, QTab, QTabPane, QBtn, QList, QItem, QIcon } from 'quasar-framework'
    import CscPage from '../../CscPage'
    import CscCallForwardDestinations from './CscCallForwardDestinations'
    export default {
        data () {
            return {
                selectedTab: "everybody"
            }
        },
        components: {
            CscPage,
            CscCallForwardDestinations,
            QTabs,
            QTab,
            QTabPane,
            QBtn,
            QList,
            QItem,
            QIcon
        },
        created() {
            this.$store.dispatch('callForward/loadDestinations', {
                timeset: null
            });
            this.$store.dispatch('callForward/loadSourcesets');
        },
        computed: {
            ...mapState('callForward', [
                'destinations',
                'sourcesets'
            ]),
            // TODO: Move these to getters instead
            everybodySourceset() {
                return this.destinations.filter((sourceset, index) => {
                    return index === 0;
                })[0];
            },
            namedDestinations() {
                return this.destinations.filter((sourceset, index) => {
                    return index > 0;
                });
            },
            alwaysTimeset() {
                return null;
            }
        },
        methods: {
            sourcesetSources(id) {
                return this.sourcesets.filter((sourceset) => {
                    return sourceset.id === id;
                })[0].sources;
            },
            destinationsCount(groups) {
                let busyLength = 0;
                let offlineLength = 0;
                let onlineLength = 0;
                if (groups.busy.length > 0) {
                    let count = 0;
                    groups.busy.forEach((destinationSet) => {
                        count += destinationSet.destinations.length;
                    });
                    busyLength = count;
                }
                if (groups.offline.length > 0) {
                    let count = 0;
                    groups.offline.forEach((destinationSet) => {
                        count += destinationSet.destinations.length;
                    });
                    offlineLength = count;
                }
                if (groups.online.length > 0) {
                    let count = 0;
                    groups.online.forEach((destinationSet) => {
                        count += destinationSet.destinations.length;
                    });
                    onlineLength = count;
                }
                return busyLength + offlineLength + onlineLength;
            },
            tabId(id) {
                if (id === null) {
                    return 0;
                }
                else {
                    return id;
                }
            },
            tabName(name) {
                if (name === null) {
                    return 'Everybody';
                }
                else {
                    return name;
                }
            },
            getState() {
                 console.log('destinations', this.destinations);
                 console.log('sourcesets', this.sourcesets);
            }
        }
    }
</script>

<style lang="stylus" rel="stylesheet/stylus">
    @import '../../../themes/quasar.variables.styl'

    .q-item-highlight.csc-destination:hover
        background-color lighten($primary, 70%)

    .sources-section
        padding 30px 0 20px 0

    .sources-title
        color $secondary
        font-size 16px

    .sources-icon
        margin-right 5px
</style>
