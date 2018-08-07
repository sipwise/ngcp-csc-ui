<template>
    <div class="col">
        <q-field class="row">
            <q-input
                v-model="stationName"
                :float-label="$t('pbxConfig.filterStationName')"
                :after="clearButton"
                @keyup="filterByStationName"
            />
        </q-field>
        <q-inner-loading
            v-show="loading"
            :visible="loading"
        >
            <q-spinner-mat
                size="60px"
                color="primary"
            />
        </q-inner-loading>
    </div>
</template>

<script>

    import { mapGetters } from 'vuex'
    import {
        QInnerLoading,
        QSpinnerMat,
        QField,
        QInput,
        debounce } from 'quasar-framework'

    export default {
        name: 'csc-pbx-station-name-input',
        data () {
            return {
                stationName: ''
            }
        },
        props: {
            loading: Boolean
        },
        components: {
            QInnerLoading,
            QSpinnerMat,
            QField,
            QInput
        },
        created() {
            if (this.listMacAddressFilter) {
                this.stationName = this.listStationNameFilter.slice(0, -1);
            }
        },
        computed: {
            ...mapGetters('pbxConfig', [
                'listStationNameFilter'
            ]),
            clearButton() {
                let self = this;
                let buttons = [];
                if (this.stationName) {
                    buttons = [{
                        icon: 'clear',
                        error: false,
                        handler (event) {
                            event.stopPropagation();
                            self.reset();
                        }
                    }];
                }
                return buttons;
            }
        },
        mounted() {
            this.debouncedFilterByStationName = debounce(() => {
                if(this.stationName === '') {
                    this.reset();
                }
                else {
                    this.$emit('filter', this.stationName + '*');
                }
            }, 800)
        },
        methods: {
            reset() {
                this.stationName = '';
                this.$emit('reset');
            },
            filterByStationName() {
                this.debouncedFilterByStationName();
            }
        },
        watch: {
            listStationNameFilter() {
                if(this.listStationNameFilter === null) {
                    this.stationName = '';
                }
            }
        }
    }
</script>

<style lang="stylus" rel="stylesheet/stylus">
    @import '../../../themes/quasar.variables.styl';
</style>