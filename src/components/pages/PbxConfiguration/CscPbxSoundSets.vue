<template>
    <csc-page
        :is-list="true"
    >
        <q-list
            striped-odd
            no-border
            multiline
            :highlight="!isMobile"
        >
            <csc-pbx-sound-set
                v-for="set in soundSets"
                :key="set.id"
                :set="set"
            />
        </q-list>
    </csc-page>
</template>

<script>
    import CscPage from '../../CscPage'
    import CscPbxSoundSet from './CscPbxSoundSet'
    import { mapGetters } from 'vuex'
    import {
        Platform,
        QList
    } from 'quasar-framework'
    export default {
        components: {
            CscPage,
            CscPbxSoundSet,
            QList
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
            ]),
            isMobile() {
                return Platform.is.mobile;
            }
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
