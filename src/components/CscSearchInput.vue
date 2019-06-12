<template>
    <div
        class="csc-search-input row items-end"
    >
        <div
            class="column inline"
        >
            <q-input
                dark
                v-model="phraseInput"
                :float-label="label"
                :disable="searching"
                @keyup.enter="search"
            />
        </div>
        <div
            class="column inline"
        >
            <q-btn
                v-if="!phrase"
                icon="search"
                color="primary"
                flat
                small
                :disable="searching"
                @click="search"
            />
            <q-btn
                v-else
                icon="clear"
                color="white"
                flat
                small
                :disable="searching"
                @click="reset"
            />
        </div>
    </div>
</template>

<script>
    import _ from 'lodash'
    import {
        QBtn,
        QInput
    } from 'quasar-framework'
    export default {
        name: 'csc-search-input',
        data () {
            return {
                phraseInput: this.phrase
            }
        },
        props: [
            'label',
            'phrase',
            'searching'
        ],
        components: {
            QBtn,
            QInput
        },
        watch: {
            phrase(value) {
                this.phraseInput = value;
            }
        },
        methods: {
            search() {
                let sanitizedInput = _.trim(this.phraseInput);
                this.$emit('search', sanitizedInput);
            },
            reset() {
                this.phraseInput = '';
                this.$emit('reset');
            }
        }
    }
</script>

<style lang="stylus" rel="stylesheet/stylus">
    @import '../themes/quasar.variables.styl'
    .csc-search-input
        .q-input
            margin-bottom 0
            margin-top 0
        .q-btn
            padding-left $flex-gutter-xs
            padding-right $flex-gutter-xs
            .q-btn-inner
                i
                    margin 0
</style>
