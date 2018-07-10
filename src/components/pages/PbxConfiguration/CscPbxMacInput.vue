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
                    this.$emit('filter', this.macAddress + '*');
                }
            }, 500)
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
                if (this.listMacAddressFilter === null) {
                    this.macAddress = '';
                }
            }
        }
    }
</script>

<style lang="stylus" rel="stylesheet/stylus">
    @import '../../../themes/quasar.variables.styl';
</style>
