<template>
    <div class="dest-section">
        <q-card-title class="dest-title">
            <q-icon :name="icon" class="dest-icon" />
            {{ title }}
        </q-card-title>
        <q-card-main>
            <q-list no-border>
                <div v-if="group.length === 0">
                    <q-item>
                        <div class="dest-row">
                            <span> {{ $t('pages.callForward.forwardToNowhere') }} </span>
                        </div>
                    </q-item>
                </div>
                <div v-else v-for="(destinationset, index) in group">
                    <csc-destination v-bind="destinationset"
                        :prev-dest-id="previousDestinationsetId(index)"
                        :next-dest-id="nextDestinationsetId(index)">
                    </csc-destination>
                </div>
            </q-list>
            <csc-add-destination-form v-bind="lastDestinationset">
            </csc-add-destination-form>
        </q-card-main>
    </div>
</template>

<script>
    import _ from 'lodash'
    import CscDestination from './CscDestination'
    import CscAddDestinationForm from './CscAddDestinationForm'
    import { showToast } from '../../../helpers/ui'
    import { QCardTitle, QCardMain, QCardSeparator,
        QItem, QList } from 'quasar-framework'
    export default {
        name: 'csc-destinations',
        props: [
            'title',
            'icon',
            'group',
            'groupName'
        ],
        components: {
            QCardTitle,
            QCardMain,
            QList,
            QItem,
            QCardSeparator,
            CscDestination,
            CscAddDestinationForm
        },
        computed: {
            lastDestinationset() {
                let destinationset = _.findLast(this.group) || {};
                destinationset.groupName = this.groupName;
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

<style lang="stylus">
@import '~variables'
.dest-section
    .dest-title
        padding 0 15px
    .dest-title:first-child
        padding 20px 15px 0 15px
    .q-item
        padding 0 15px
    .q-list
        margin-bottom 0
.dest-row
    inline-block
.dest-title
    color $primary
.dest-icon
    margin-right 5px
</style>
