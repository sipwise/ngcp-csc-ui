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
            this.$store.dispatch('callForward/loadSourcesetsCount').then(() => {
            }).catch((err) => {
                console.log(err);
            });
            this.$store.dispatch('callForward/loadTimesetsCount').then(() => {
            }).catch((err) => {
                console.log(err);
            });
            this.$store.dispatch('callForward/loadDestinationsetsCount').then(() => {
            }).catch((err) => {
                console.log(err);
            });
            this.$store.dispatch('callForward/loadSourcesets').then(() => {
            }).catch((err) => {
                console.log(err);
            });
        },
        computed: {
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
            return this.$store.state.callForward.sourcesets;
            }
        },
        watch: {
            sourcesetsCount: function() {
                console.log('sourcesetsCount changed!');
            }
        }
    }
</script>

<style>
</style>
