<template>
    <csc-page
        class="csc-simple-page"
    >
        <div
            class="row"
        >
            <div
                class="col col-xs-12 col-md-6"
            >
                <q-field
                    class="csc-form-field"
                >
                    <q-toggle
                        :label="toggleLabel"
                        :value="primaryNumberEnabled"
                        :left-label="true"
                        @input="togglePrimaryNumber()"

                    />
                </q-field>
            </div>
        </div>
    </csc-page>
</template>

<script>
    import { mapState, mapGetters } from 'vuex'
    import {
        QField,
        QToggle
    } from 'quasar-framework'
    import CscPage from '../../CscPage'
    export default {
        data () {
            return {};
        },
        components: {
            CscPage,
            QField,
            QToggle
        },
        created() {},
        computed: {
            ...mapState('newCallForward', []),
            ...mapGetters('newCallForward', [
                'subscriberDisplayName'
            ]),
            primaryNumberEnabled(){
                return true;
            },
            toggleLabel(){
                return `${this.$t('pages.newCallForward.primarNumberEnabled')} ${this.subscriberDisplayName}`;
            }
        },
        methods: {
            togglePrimaryNumber(){}
        },
        watch: {}
    }
</script>

<style lang="stylus" rel="stylesheet/stylus">
</style>
