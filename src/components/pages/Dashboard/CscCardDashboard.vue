<template>
    <q-card
        dark
        bordered
        class="my-card csc-card-style column csc-item-odd no-wrap"
    >
        <q-card-section>
            <div class="text-h6 text-center">
                {{ title }}
            </div>
        </q-card-section>

        <q-separator
            dark
            inset
        />

        <q-card-section>
            <div
                v-if="!loading && error"
                class="text-h2 text-center csc-card-data-error"
            >
                N/A
            </div>
            <div
                v-if="!loading && !error"
                class="text-h2 text-center"
            >
                {{ count }}
            </div>
            <div
                class="text-h2 text-center"
            >
                <csc-spinner
                    v-if="loading"
                />
            </div>
            <div
                v-if="!error"
                class="text-center"
            >
                {{ countTitle }}
            </div>
        </q-card-section>

        <q-separator
            dark
            inset
        />

        <q-card-section
            class="csc-card-list"
        >
            <q-list
                v-for="(item, index) in shortItemsList"
                :key="item.id"
            >
                <template v-if="useSlot">
                    <slot
                        name="listItems"
                        :call="item.call"
                        :index="index"
                    />
                </template>
                <template v-else>
                    <q-item>
                        <q-item-section avatar>
                            <q-icon
                                v-if="!item.clickable_icon"
                                :color="item.icon.color"
                                clickable
                                :name="item.icon.name"
                            />
                            <q-btn
                                v-if="item.clickable_icon"
                                flat
                                :color="item.icon.color"
                                :icon="item.icon.name"
                                @click="$emit('action', item.id)"
                            />
                        </q-item-section>

                        <q-item-section>
                            <q-item-label>{{ item.title }}</q-item-label>
                            <q-item-label caption>
                                {{ item.sub_title }}
                            </q-item-label>
                        </q-item-section>

                        <q-item-section side>
                            <q-item-label caption>
                                {{ item.extra_text }}
                            </q-item-label>
                        </q-item-section>
                    </q-item>
                </template>
                <q-separator
                    v-if="index !== shortItemsList.length-1"
                    spaced
                />
            </q-list>
            <div
                v-if="!loading && shortItemsList.length === 0"
                class="text-center"
            >
                {{ error ? $t('Data loading error') : noItemsMessage }}
            </div>
            <div
                class="text-center"
            >
                <csc-spinner
                    v-if="loading"
                />
            </div>
        </q-card-section>

        <q-separator
            dark
            inset
        />

        <q-card-section
            class="csc-card-footer text-center justify-center"
        >
            <q-btn
                color="primary"
                unelevated
                flat
                :label="buttonTitle"
                :to="routeTo"
                class="vertical-middle  justify-center"
            />
        </q-card-section>
    </q-card>
</template>

<script>
import CscSpinner from 'components/CscSpinner'
export default {
    name: 'CscCardDashboard',
    components: {
        CscSpinner
    },
    props: {
        title: {
            type: String,
            default: ''
        },
        count: {
            type: Number,
            default: 0
        },
        countTitle: {
            type: String,
            default: ''
        },
        buttonTitle: {
            type: String,
            default: ''
        },
        itemsList: {
            type: Array,
            default () {
                return []
            }
        },
        routeTo: {
            type: [Object, String],
            required: true
        },
        loading: {
            type: Boolean,
            default: false
        },
        error: {
            type: Boolean,
            default: false
        },
        noItemsMessage: {
            type: String,
            default: ''
        },
        useSlot: {
            type: Boolean,
            default: false
        }
    },
    emits: ['action'],
    computed: {
        shortItemsList () {
            return this.itemsList.length >= 5 ? this.itemsList.slice(0, 5) : this.itemsList
        }
    }
}
</script>

<style lang="sass" rel="stylesheet/sass">
.csc-card-style
    margin: 10px
    width: 30%
    height: max-content
    min-width: 284px

.csc-card-data-error
    color: $negative
    padding-bottom: 22px

.csc-card-list
    height:  450px

.csc-card-footer
    height: 80px
</style>
