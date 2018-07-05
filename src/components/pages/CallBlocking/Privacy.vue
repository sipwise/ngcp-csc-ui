<template>
    <csc-page
        class="csc-simple-page"
    >
        <q-field
            class="csc-privacy"
        >
            <q-toggle
                :label="privacyLabel"
                :value="privacy"
                @input="toggle()"
            />
            <q-inner-loading
                v-if="privacyLoading"
                :visible="privacyLoading"
            >
                <q-spinner-mat
                    size="30px"
                    color="primary"
                />
            </q-inner-loading>
        </q-field>
    </csc-page>
</template>

<script>

    import {
        mapGetters
    } from 'vuex'
    import {
        showToast
    } from '../../../helpers/ui'
    import CscPage  from '../../CscPage'
    import {
        QField,
        QToggle,
        Toast,
        QInnerLoading,
        QSpinnerMat
    } from 'quasar-framework'

    export default {
        data () {
            return {}
        },
        components: {
            CscPage,
            QToggle,
            Toast,
            QField,
            QInnerLoading,
            QSpinnerMat
        },
        mounted() {
            this.$store.dispatch('callBlocking/loadPrivacy');
        },
        computed: {
            privacyLabel() {
                if(this.privacy) {
                    return this.$t('callBlocking.privacyEnabledLabel');
                }
                else {
                    return this.$t('callBlocking.privacyDisabledLabel');
                }
            },
            ...mapGetters('callBlocking', [
                'privacy',
                'privacyError',
                'privacyUpdated',
                'privacyLoadingState',
                'privacyLoading'
            ])
        },
        methods: {
            toggle () {
                this.$store.dispatch('callBlocking/updatePrivacy', !this.privacy);
            }
        },
        watch: {
            privacyUpdated(updated) {
                if(updated && this.privacy) {
                    showToast(this.$t('callBlocking.privacyEnabledToast'));
                }
                else if (updated && !this.privacy) {
                    showToast(this.$t('callBlocking.privacyDisabledToast'));
                }
            }
        }
    }
</script>

<style lang="stylus" rel="stylesheet/stylus">
    .csc-privacy
        position relative
</style>
