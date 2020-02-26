<template>
    <div
        class="csc-cf-group csc-cf-row"
    >
        <div
            v-if="group.id !== 'unconditional'"
            class="csc-cf-group-title"
        >
            {{ group.title }}
        </div>
        <div
            class="csc-cf-destination row"
            v-for="destination in group.destinations"
            key="destination.id"
        >
            <div
                class="csc-cf-destination-label col col-md-4"
            >
                {{ destination.label }}
            </div>
            <div
                class="csc-cf-destination-value col col-md-2"
            >
                {{ destination.value }}
            </div>
            <div
                class="csc-cf-destination-actions col col-md-6"
            >

            </div>
        </div>
        <div
            class="row"
        >
            <div
                class="csc-cf-destination-label col col-4"
            >
                {{ $t('pages.newCallForward.allCallsForwardedTo') }}
            </div>
            <div
                class="csc-cf-destination-value col col-2"
            >
                <span
                    class="csc-text-action"
                >
                    {{ $t('pages.newCallForward.addDestinationLabel') }}
                    <q-popover
                        ref="groupMenu"
                        :disable="true"
                    >
                        <q-list
                            link
                            no-border
                        >
                            <q-item
                            >
                                <q-item-side
                                    icon="number"
                                />
                                <q-item-main>
                                    Number
                                </q-item-main>
                            </q-item>
                        </q-list>
                    </q-popover>
                </span>
            </div>
            <div
                class="csc-cf-destination-actions col col-6"
            >
                <q-icon
                    name="delete"
                    color="negative"
                    size="24px"
                />
            </div>
        </div>
    </div>
</template>


<script>
    import {
        QIcon,
        QPopover,
        QList,
        QItem,
        QItemMain,
        QItemSide
    } from 'quasar-framework'
    export default {
        name: 'csc-cf-group',
        props: [
            'group'
        ],
        components: {
            QIcon,
            QPopover,
            QList,
            QItem,
            QItemMain,
            QItemSide
        },
        data () {
            return {};
        },
        computed: {
        },
        methods: {
            addDestination() {

            }
        }
    }
</script>

<style lang="stylus" rel="stylesheet/stylus">
    .csc-cf-group-title
        text-align right
    .csc-cf-destination-label
        text-align right
    .csc-cf-destination-value
        text-align center
    .csc-cf-destination-actions
        text-align left
</style>
