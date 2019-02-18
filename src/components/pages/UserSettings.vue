
<template>
    <csc-page class="csc-simple-page">
        <!--<div-->
            <!--class="row">-->
            <!--<div-->
                <!--class="col col-xs-12 col-md-6">-->
                <!--<q-field-->
                    <!--class="csc-form-field"-->
                    <!--icon="language">-->
                    <!--<q-inner-loading :visible="false">-->
                        <!--<q-spinner-dots-->
                            <!--color="primary"-->
                            <!--:size="24"/>-->
                    <!--</q-inner-loading>-->
                    <!--<q-select-->
                        <!--dark-->
                        <!--:disable="false"-->
                        <!--:float-label="$t('userSettings.changeLanguage')"-->
                        <!--v-model="language"-->
                        <!--:options="languageOptions"-->
                        <!--@change="updateLanguage"/>-->
                <!--</q-field>-->
            <!--</div>-->
        <!--</div>-->
    </csc-page>
</template>

<script>
    //import { mapGetters } from 'vuex'
    //import {
    //    startLoading,
    //    stopLoading,
    //    showToast,
    //} from '../../helpers/ui'
    //import {
    //    QField,
    //    QSelect,
    //    QInnerLoading,
    //    QSpinnerDots,
    //    QBtn
    //} from 'quasar-framework'
    import CscPage from '../CscPage'

    export default {
        data () {
            return {
                language: 'en',
                languageOptions: [
                    {
                        label: 'English',
                        value: 'en'
                    },
                    {
                        label: 'Français',
                        value: 'fr'
                    }
                ]
            }
        },
        components: {
            CscPage
        },
        created() {
        },
        computed: {
        },
        methods: {
        },
        watch: {
        }
    }
</script>

<style lang="stylus" rel="stylesheet/stylus">
    @import '../../themes/quasar.variables.styl';
</style>
