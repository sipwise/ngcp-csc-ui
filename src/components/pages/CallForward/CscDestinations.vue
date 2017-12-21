<template>
    <q-card class="destination-card">
        <q-card-title>
            {{ title }}
        </q-card-title>
        <q-card-main>
            <q-list no-border>
                <q-item highlight v-for="(destination, index) in destinations">
                    <div v-if="index == 0" class="dest-prefix-label">
                        first ring
                    </div>
                    <div v-else-if="index == 1" class="dest-prefix-label">
                        then forward to ...
                    </div>
                    <div v-else-if="index > 1" class="dest-prefix-label">
                    </div>
                    <div class="dest-row" style="display:inline-block;">
                        <span>{{ destination.simple_destination }}</span>
                        <span class="dest-ring-for"> and ring for </span>
                        <span>{{ destination.timeout }}</span>
                        <span class="dest-secs"> secs</span>
                    </div>
                </q-item>
            </q-list>
        </q-card-main>
    </q-card>
</template>

<script>
    import { QCard, QCardTitle, QCardMain,
        QList, QItem } from 'quasar-framework'
    export default {
        name: 'csc-destinations',
        props: [
            'title',
            'destinations'
        ],
        components: {
            QCard,
            QCardTitle,
            QCardMain,
            QList,
            QItem
        },
        computed: {

        },
        methods: {
        }
    }
</script>

<style lang="stylus">
.dest-prefix-label
    display inline-block
    width 160px
</style>
