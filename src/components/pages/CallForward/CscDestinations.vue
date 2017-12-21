<template>
    <div>
        <q-card-title class="dest-title">
            <q-icon :name="icon" class="dest-icon" />
            {{ title }}
        </q-card-title>
        <q-card-main>
            <q-list no-border>
                <div v-for="mapping in grouping">
                    <csc-destination :destinations="mapping.destinations">
                    </csc-destination>
            </div>
            </q-list>
        </q-card-main>
    </div>
</template>

<script>
    import CscDestination from './CscDestination'
    import { QCardTitle, QCardMain, QList, QIcon } from 'quasar-framework'
    export default {
        name: 'csc-destinations',
        props: [
            'title',
            'icon',
            'grouping'
        ],
        components: {
            QCardTitle,
            QCardMain,
            QList,
            QIcon,
            CscDestination
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
