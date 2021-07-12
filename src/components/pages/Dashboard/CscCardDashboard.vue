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
        />

        <q-separator
            dark
            inset
        />

        <q-card-section
            class="text-center"
        >
            <q-btn
                color="primary"
                unelevated
                flat
                :label="buttonTitle"
                :to="routeTo"
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
        }
    }
}
</script>

<style lang="stylus" rel="stylesheet/stylus">
    .csc-card-style
        margin 10px
        width 30%
        height max-content
        min-width 284px

    .csc-card-data-error
        color: $negative
        padding-bottom: 22px

    .csc-card-list
        min-height: 316px
</style>
