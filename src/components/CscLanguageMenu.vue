<template>
    <q-list
        no-border
    >
        <q-expansion-item
            ref="languageCollapsible"
            v-model="expanded"
            :label="languageLabel"
        >
            <q-list
                no-border
            >
                <q-item
                    v-for="(language, index) in languageLabels"
                    :key="index"
                    v-close-popup
                    clickable
                    @click="changeSessionLanguage(language[0])"
                >
                    <q-item-main
                        :label="language[1]"
                    />
                </q-item>
            </q-list>
        </q-expansion-item>
    </q-list>
</template>

<script>
import {
    mapActions
} from 'vuex'
export default {
    name: 'CscLanguageMenu',
    props: {
        languageLabel: {
            type: String,
            required: true
        },
        languageLabels: {
            type: Array,
            required: true
        }
    },
    data () {
        return {
            expanded: false
        }
    },
    methods: {
        ...mapActions('user', [
            'changeSessionLanguage'
        ])
    }
}
</script>

<style lang="stylus" rel="stylesheet/stylus">
    .csc-language-selection
        .q-item-side-right
            color white
</style>
