<template>
    <q-card flat class="destination-card">
        <q-card-title>
            {{ title }}
        </q-card-title>
        <q-card-main>
            <q-list no-border>
                <q-item highlight v-for="(destination, index) in destinations">
                    <div class="dest-row" style="display:inline-block;">
                        <span v-if="index == 0"> first ring </span>
                        <span v-else-if="index > 0"> then ring </span>
                        <span class="dest-values">{{ destination.simple_destination }}</span>
                        <span> for </span>
                        <span class="dest-values">{{ destination.timeout }}</span>
                        <span> secs</span>
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
.dest-row
    .dest-values
        font-weight 500
</style>
