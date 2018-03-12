<template>
    <csc-page :title="$t('pages.callForward.titles.always')">
        <q-tabs>
            <q-tab default slot="title" name="everybody" icon="people" label="Everybody" />
            <!--TODO: Try new approach where we are getting, if possible, all state data from destinations instead of sourcesets combined with destinations-->
            <q-tab v-for="sourceset in sourcesets" :key="sourceset.id" slot="title" :name="sourceset.name" icon="people" :label="sourceset.name" />
            <q-tab-pane name="everybody"></q-tab-pane>
            <!--TODO: Try new approach where we are getting, if possible, all state data from destinations instead of sourcesets combined with destinations-->
            <q-tab-pane v-for="(sourceset, index) in sourcesets" :key="sourceset.id" :name="sourceset.name">
                {{ sourceset.name }}
                <!--<csc-call-forward-destinations :timeset="alwaysTimeset" :destinations="destinations[index].destinationGroups" />-->
            </q-tab-pane>
        </q-tabs>
        <q-btn @click="getState()">
            LOG STATE
        </q-btn>
    </csc-page>
</template>

<script>
    import { mapState } from 'vuex'
    import { QTabs, QTab, QTabPane, QBtn } from 'quasar-framework'
    import CscPage from '../../CscPage'
    import CscCallForwardDestinations from './CscCallForwardDestinations'
    export default {
        data () {
            return {
                selectedTab: "everybody"
            }
        },
        components: {
            CscPage,
            CscCallForwardDestinations,
            QTabs,
            QTab,
            QTabPane,
            QBtn
        },
        created() {
            this.$store.dispatch('callForward/loadDestinations', {
                timeset: null
            });
            this.$store.dispatch('callForward/loadSourcesets');
        },
        computed: {
            ...mapState('callForward', [
                'destinations',
                'sourcesets'
            ]),
            //sourcesets() {
            //    return this.destinations.map((destination) => {
            //        let name = destination.sourcesetName || 0;
            //        let id = destination.sourcesetId || 0;
            //        return {
            //            id: id,
            //            name: name
            //        }
            //    });
            //},
            alwaysTimeset() {
                return null;
            }
        },
        methods: {
            getState() {
                 console.log('destinations', this.destinations);
                 console.log('sourcesets', this.sourcesets);
            }
        }
    }
</script>

<style lang="stylus" rel="stylesheet/stylus">
</style>
