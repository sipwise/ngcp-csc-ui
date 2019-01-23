<template>
    <csc-page
        :is-list="true"
    >
        <q-list>
            <q-item v-for="(set, index) in soundSets" :key="index">
                {{ set.name }}
            </q-item>
        </q-list>
    </csc-page>
</template>

<script>
    import CscPage from '../../CscPage'
    import { mapGetters } from 'vuex'
    import {
        QList,
        QItem
    } from 'quasar-framework'
    export default {
        components: {
            CscPage,
            QList,
            QItem
        },
        data () {
            return {
            }
        },
        mounted() {
            this.$store.dispatch('pbxConfig/getSoundSets');
        },
        computed: {
            ...mapGetters('pbxConfig', [
                'soundSets'
            ])
        },
        methods: {
        },
        watch: {
        }
    }
</script>

<style lang="stylus" rel="stylesheet/stylus">
    @import '../../../themes/quasar.variables.styl';
</style>
