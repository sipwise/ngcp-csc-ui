<template>
	<q-tabs no-pane-border>
		<q-tab v-for="(sourceset, index) in destinations" :default="index === 0"
            :count="destinationsCount(sourceset.destinationGroups)"
            :key="sourceset.sourcesetId || 0" slot="title"
            :name="sourceset.sourcesetName || 'Everybody'" icon="people"
            :label="sourceset.sourcesetName || 'Everybody'" />
		<q-tab-pane v-for="sourceset in destinations"
            :key="sourceset.sourcesetId || 0"
            :name="sourceset.sourcesetName || 'Everybody'">
                <div class="sources-section" v-if="sourceset.sourcesetId">
                    <div class="sources-title">
                        <q-icon name="contact_phone" class="sources-icon" />
                        {{ $t('pages.callForward.titles.sources') }}
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
	</q-tabs>
</template>

<script>
    import CscCallForwardDestinations from './CscCallForwardDestinations'
    import {
        QTabs,
        QTab,
        QTabPane,
        QBtn,
        QList,
        QItem,
        QIcon
    } from 'quasar-framework'
    export default {
        name: 'csc-sourcesets',
        props: [
            'destinations',
            'sourcesets',
			'timesetName'
        ],
        components: {
            CscCallForwardDestinations,
            QTabs,
            QTab,
            QTabPane,
            QBtn,
            QList,
            QItem,
            QIcon
        },
        computed: {
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
</style>
