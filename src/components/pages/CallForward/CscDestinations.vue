<template>
    <div class="dest-section">
        <div class="dest-title">
            <q-icon :name="icon" class="dest-icon" />
            {{ title }}
        </div>
        <div>
            <q-list no-border>
                <q-item v-if="group.length === 0" class="dest-row csc-no-destination">
                    <span> {{ $t('pages.callForward.forwardToNowhere') }} </span>
                </q-item>
                <div v-else :key="index" v-for="(destinationset, index) in group">
                    <csc-destination v-bind="destinationset"
                        :prev-dest-id="previousDestinationsetId(index)"
                        :next-dest-id="nextDestinationsetId(index)"
                    />
                </div>
            </q-list>
            <csc-add-destination-form v-bind="lastDestinationset" />
        </div>
    </div>
</template>

<script>
    import _ from 'lodash'
    import CscDestination from './CscDestination'
    import CscAddDestinationForm from './CscAddDestinationForm'
    import {  QList, QItem, QIcon } from 'quasar-framework'
    export default {
        name: 'csc-destinations',
        props: [
            'title',
            'icon',
            'group',
            'groupName',
            'timeset'
        ],
        components: {
            QList,
            QItem,
            QIcon,
            CscDestination,
            CscAddDestinationForm
        },
        computed: {
            lastDestinationset() {
                let destinationset = _.findLast(this.group) || {};
                destinationset.groupName = this.groupName;
                destinationset.priority = destinationset.lowestPriority || 1;
                destinationset.timeset = this.timeset;
                return destinationset;
            }
        },
        methods: {
            previousDestinationsetId(index) {
                let destinationset = this.group[index-1] || {};
                return destinationset.id || null;
            },
            nextDestinationsetId(index) {
                let destinationset = this.group[index+1] || {};
                return destinationset.id || null;
            }
        }
    }
</script>

<style lang="stylus" rel="stylesheet/stylus">
    @import '../../../themes/quasar.variables.styl'

    .dest-section
        padding-top 30px
        padding-bottom 30px

    .dest-title
        color $primary

    .dest-icon
        margin-right 5px

    .q-item.csc-no-destination
        margin-left 0px
        padding 0
</style>
