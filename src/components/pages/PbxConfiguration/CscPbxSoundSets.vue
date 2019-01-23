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
            <!--<csc-pbx-sound-set-->
                <!--v-for="set in soundSets"-->
                <!--:key="set.id"-->
                <!--:set="set"-->
            <!--/>-->
            <q-btn
                color="primary"
                @click="logSet"
            >
                DATA
            </q-btn>
            <q-btn
                color="primary"
                @click="apiTest"
            >
                API TEST
            </q-btn>
        </q-list>
    </csc-page>
</template>

<script>
    import CscPage from '../../CscPage'
    import CscPbxSoundSet from './CscPbxSoundSet'
    import { mapGetters } from 'vuex'
    import {
        Platform,
        QList,
        QBtn
    } from 'quasar-framework'
    export default {
        components: {
            CscPage,
            CscPbxSoundSet,
            QList,
            QBtn
        },
        data () {
            return {
            }
        },
        mounted() {
            //this.$store.dispatch('pbxConfig/listSoundSets');
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
            logSet() {
                console.log('soundSets', this.soundSets);
            },
            apiTest() {
                this.$store.dispatch('pbxConfig/apiTest');
            }
        },
        watch: {
        }
    }
</script>

<style lang="stylus" rel="stylesheet/stylus">
    @import '../../../themes/quasar.variables.styl';
</style>
