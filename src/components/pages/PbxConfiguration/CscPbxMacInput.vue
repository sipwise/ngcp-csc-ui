<template>
    <div class="col">
        <q-field class="row">
            <q-input
                v-model="macAddress"
                :float-label="$t('pbxConfig.filterMacAddress')"
                :after="clearButton"
                @keyup="filterByMacAddress"
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
        name: 'csc-pbx-mac-input',
        data () {
            return {
                macAddress: ''
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
                this.macAddress = this.listMacAddressFilter.slice(0, -1);
            }
        },
        computed: {
            ...mapGetters('pbxConfig', [
                'listMacAddressFilter'
            ]),
            clearButton() {
                let self = this;
                let buttons = [];
                if (this.macAddress) {
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
            this.debouncedFilterByMacAddress = debounce(() => {
                if(this.macAddress === '') {
                    this.reset();
                }
                else {
                    this.$emit('filter', { identifier: this.macAddress + '*'});
                }
            }, 800)
        },
        methods: {
            reset() {
                this.macAddress = '';
                this.$emit('reset');
            },
            filterByMacAddress() {
                this.debouncedFilterByMacAddress();
            }
        },
        watch: {
            listMacAddressFilter() {
                if(this.listMacAddressFilter === null) {
                    this.macAddress = '';
                }
            }
        }
    }
</script>

<style lang="stylus" rel="stylesheet/stylus">
    @import '../../../themes/quasar.variables.styl';
</style>
