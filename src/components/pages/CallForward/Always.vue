<template>
    <csc-page title="Always">
    <div>
        <h2>Dev Test To Show API method results:</h2>
        <hr />
        <p><strong>getSourcesetsCount():</strong> {{ sourcesetsCount }}</p>
        <p><strong>getTimesetsCount():</strong> {{ timesetsCount }}</p>
        <p><strong>getDestinationsetsCount():</strong> {{ destinationsetsCount }}</p>
        <p><strong>getMappings():</strong> {{ mappings }}</p>
        <p><strong>getSourcesets():</strong> {{ sourcesets }}</p>
        <p><strong>getTimesets():</strong> {{ timesets }}</p>
        <p><strong>getDestinationsets():</strong> {{ destinationsets }}</p>
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
                mappings: null,
                sourcesets: null,
                timesets: null,
                destinationsets: null
            }

        },
        components: {
            CscPage
        },
        mounted() {
            this.$store.dispatch('callForward/loadMappings').then(result => {
                this.mappings = result.cfb[0].destinationset;
                resolve();
            }).catch(err => {});
            this.$store.dispatch('callForward/loadSourcesetsCount').then(result => {
                this.sourcesetsCount = this.store.$state.countSourcesets;
                resolve();
            }).catch(err => {});
            this.$store.dispatch('callForward/loadTimesetsCount').then(result => {
                this.timesetsCount = result;
                resolve();
            }).catch(err => {});
            this.$store.dispatch('callForward/loadDestinationsetsCount').then(result => {
                this.destinationsetsCount = result;
                resolve();
            }).catch(err => {});
        }
    }
</script>

<style>
</style>
