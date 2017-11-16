<template>
    <csc-page title="Always">
    <div>
        <h2>Dev Test To Show API method results:</h2>
        <hr />
        <p v-model="sourcesetsCount"><strong>getSourcesetsCount():</strong> {{ sourcesetsCount }}</p>
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
            }
        },
        components: {
            CscPage
        },
        mounted() {
            this.$store.dispatch('callForward/loadMappings').then(() => {
            }).catch((err) => { console.log(err); });
            this.$store.dispatch('callForward/loadSourcesetsCount').then(() => {
            }).catch((err) => { console.log(err); });
            this.$store.dispatch('callForward/loadTimesetsCount').then(() => {
            }).catch((err) => { console.log(err); });
            this.$store.dispatch('callForward/loadDestinationsetsCount').then(() => {
            }).catch((err) => { console.log(err); });
            this.$store.dispatch('callForward/loadSourcesets').then(() => {
            }).catch((err) => { console.log(err); });
            this.$store.dispatch('callForward/loadTimesets').then(() => {
            }).catch((err) => { console.log(err); });
            this.$store.dispatch('callForward/loadDestinationsets').then(() => {
            }).catch((err) => { console.log(err); });
        },
        computed: {
            mappings() {
                return !this.$store.state.callForward.mappings ? null : this.$store.state.callForward.mappings.cfb[0].destinationset;
            },
            sourcesetsCount() {
                return this.$store.state.callForward.countSourcesets;
            },
            timesetsCount() {
                return this.$store.state.callForward.countTimesets;
            },
            destinationsetsCount() {
                return this.$store.state.callForward.countDestinationsets;
            },
            sourcesets() {
                return !this.$store.state.callForward.sourcesets ? null : this.$store.state.callForward.sourcesets[0].name;
            },
            timesets () {
                return !this.$store.state.callForward.timesets ? null : this.$store.state.callForward.timesets[0].name;
            },
            destinationsets() {
                return !this.$store.state.callForward.destinationsets ? null : this.$store.state.callForward.destinationsets[0].name;
            }
        }
    }
</script>

<style>
</style>
