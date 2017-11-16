<template>
    <csc-page title="Always">
    <div>
        <h2>Dev Test To Show API method results:</h2>
        <p><strong>getSourcesetsCount():</strong> {{ sourcesetsCount }}</p>
        <p><strong>getTimesetsCount():</strong> {{ timesetsCount }}</p>
        <p><strong>getDestinationsetsCount():</strong> {{ destinationsetsCount }}</p>
        <p><strong>getMappings():</strong> {{ mappings }}</p>
    </div>
    </csc-page>
</template>

<script>
    import CscPage  from '../../CscPage'
    export default {
        data () {
            return {
                sourcesetsCount: null,
                timesetsCount: null,
                destinationsetsCount: null,
                mappings: null
            }

        },
        components: {
            CscPage
        },
        mounted() {
            this.$store.dispatch('callForward/loadMappings').then(result => {
                this.mappings = result.cfb[0].destinationset;
            }).catch(err => {});
            this.$store.dispatch('callForward/loadSourcesetsCount').then(result => {
                this.sourcesetsCount = result;
            }).catch(err => {});
            this.$store.dispatch('callForward/loadTimesetsCount').then(result => {
                this.timesetsCount = result;
            }).catch(err => {});
            this.$store.dispatch('callForward/loadDestinationsetsCount').then(result => {
                this.destinationsetsCount = result;
            }).catch(err => {});
        },
        computed: {
            count() {
                return this.$store.state.sourcesetsCount;
            }
        }
    }
</script>

<style>
</style>
