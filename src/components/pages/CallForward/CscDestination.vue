<template>
    <div>
        <q-item highlight v-for="(destination, index) in destinations">
            <div class="dest-row" style="display:inline-block;">
                <span v-if="index == 0"> first ring </span>
                <span v-else-if="index > 0"> then ring </span>
                <span class="dest-values">{{ destination.destination | numberFormat }}</span>
                <span v-if="isNumber(destination.destination)">
                    <span> for </span>
                    <span class="dest-values">{{ destination.timeout }}</span>
                    <span> secs</span>
                </span>
            </div>
            <q-item-side right icon="delete" @click="deleteDestination(index)" />
        </q-item>
    </div>
</template>

<script>
    import numberFormat from '../../../filters/number-format'
    import _ from 'lodash'
    import { QItem, QItemSide } from 'quasar-framework'
    export default {
        name: 'csc-destination',
        props: [
            'destinations',
            'destinationsetId'
        ],
        components: {
            QItem,
            QItemSide
        },
        computed: {
        },
        methods: {
            isNumber(destination) {
                let dest = destination.split(/:|@/);
                return !isNaN(dest[1]);
            },
            deleteDestination(index) {
                let clonedDestinations = _.cloneDeep(this.destinations);
                let indexInt = parseInt(index);
                clonedDestinations.splice(indexInt, 1);
                this.$store.dispatch('callForward/deleteDestinationFromDestinationset', {
                    id: this.destinationsetId,
                    data: clonedDestinations }).then(result => {
                        console.log('result', result);
                        this.$store.dispatch('callForward/loadAlwaysEverybodyDestinations');
                    }).catch((err) => {
                        // TODO: Display error message
                    });
            }
        }
    }
</script>

<style lang="stylus">
@import '~variables'
.dest-title
    color $primary
.dest-icon
    margin-right 5px
.dest-row
    .dest-values
        font-weight 500
</style>
