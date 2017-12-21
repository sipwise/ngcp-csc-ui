<template>
    <div>
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
                <div v-else v-for="destinationset in group">
                    <csc-destination :destinations="destinationset.destinations" :destinationset-id="destinationset.id">
                    </csc-destination>
            </div>
            </q-list>
        </q-card-main>
    </div>
</template>

<script>
    import CscDestination from './CscDestination'
    import { QCardTitle, QCardMain, QList,
        QItem, QIcon } from 'quasar-framework'
    export default {
        name: 'csc-destinations',
        props: [
            'title',
            'icon',
            'group'
        ],
        components: {
            QCardTitle,
            QCardMain,
            QList,
            QItem,
            QIcon,
            CscDestination
        }
    }
</script>

<style lang="stylus">
@import '~variables'
.dest-row
    inline-block
.dest-title
    color $primary
.dest-icon
    margin-right 5px
</style>
