<template>
    <csc-page>
        <csc-sourcesets
            v-if="destinationsLoaded"
            :sourcesets="sourcesets"
            :destinations="destinations"
            :timesetName="timesetName"
            ref="sourcesets"
        />
    </csc-page>
</template>

<script>
    import { mapState, mapGetters } from 'vuex'
    import {
        startLoading,
        stopLoading,
        showToast,
        showGlobalError
    } from '../../../helpers/ui'
    import CscPage from '../../CscPage'
    import CscSourcesets from './CscSourcesets'
    export default {
        data () {
            return {
                timesetName: null // In API layer the actual value used is null
            }
        },
        components: {
            CscPage,
            CscSourcesets
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
                'sourcesets',
                'loadDestinationState',
                'loadDestinationError',
                'addSourcesetState',
                'lastAddedSourceset'
            ]),
            ...mapGetters('callForward', [
                'addSourcesetError',
                'destinationsLoaded'
            ]),
            destinationsLoaded() {
                return this.destinations.length > 0;
            }
        },
        watch: {
            loadDestinationState(state) {
                if (state === 'requesting') {
                    startLoading();
                }
                else if (state === 'failed') {
                    stopLoading();
                    showGlobalError(this.loadDestinationError);
                }
                else if (state === 'succeeded') {
                    stopLoading();
                }
            },
            addSourcesetState(state) {
                if (state === 'requesting') {
                    startLoading();
                }
                else if (state === 'failed') {
                    stopLoading();
                    showGlobalError(this.addSourcesetError);
                }
                else if (state === 'succeeded') {
                    stopLoading();
                    this.$refs.sourcesets.resetForm();
                    showToast(this.$t('pages.callForward.sources.addSuccessMessage', {
                        sourceset: this.lastAddedSourceset
                    }));
                    this.$store.dispatch('callForward/loadDestinations', {
                        timeset: null
                    });
                    this.$store.dispatch('callForward/loadSourcesets');
                }
            }
        }
    }
</script>

<style lang="stylus" rel="stylesheet/stylus">
</style>
