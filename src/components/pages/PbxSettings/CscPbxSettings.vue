
<template>
    <csc-page
        class="csc-simple-page">
        <div
            class="row"
        >
            <div
                class="col col-xs-12 col-md-12"
            >
                <q-toggle
                    :disabled="isLoading"
                    class="csc-pbx-settings-toggle"
                    :label="clirIntrapbx ? $t('pbxConfig.selfPbxHidden') : $t('pbxConfig.selfPbxVisible')"
                    v-model="clirIntrapbx"
                    @change="changeIntraPbx"
                    checked-icon="visibility_off"
                    unchecked-icon="visibility"
                />
                <q-spinner-dots
                    v-if="isLoading"
                    class="csc-pbx-settings-spinner"
                    color="primary"
                    :size="24"
                />
            </div>
        </div>
    </csc-page>
</template>

<script>
    import {
        QToggle,
        QSpinnerDots
    } from 'quasar-framework'
    import { mapState, mapActions, mapGetters } from 'vuex'
    import CscPage from '../../CscPage'
    import {
        showGlobalError,
        showToast
    } from '../../../helpers/ui'
    import {
        RequestState
    } from "../../../store/common";
    export default {
        data () {
            return {
                clirIntrapbx: false,
                isLoading: false
            }
        },
        components: {
            QToggle,
            QSpinnerDots,
            CscPage
        },
        async mounted() {
            this.requestInProgress(true);
            const subscriberId = localStorage.getItem('subscriberId');
            const preferences = await this.loadPreferences(subscriberId);
            this.clirIntrapbx = preferences.clir_intrapbx;
            this.requestInProgress(false);
        },
        computed: {
            ...mapGetters('pbxSeats', [
                'getIntraPbx'
            ]),
            ...mapState('pbxSeats', [
                'seatUpdateState',
                'seatUpdateError'
            ]),
        },
        watch: {
            seatUpdateState(state) {
                switch(state){
                    case RequestState.requesting:
                        this.requestInProgress(true);
                    break;
                    case RequestState.succeeded :
                        showToast(this.clirIntrapbx ? this.$t('pbxConfig.selfPbxHidden') : this.$t('pbxConfig.selfPbxVisible'));
                        this.requestInProgress(false);
                    break;
                    case RequestState.failed :
                        showGlobalError(this.seatUpdateError, 5000);
                        this.requestInProgress(false);
                    break;
                }
            },
        },
        methods: {
            ...mapActions('pbxSeats', [
                'setIntraPbx',
                'loadPreferences'
            ]),
            changeIntraPbx(){
                const msg = this.clirIntrapbx ? this.$t('pbxConfig.selfPbxHidden') : this.$t('pbxConfig.selfPbxVisible');
                this.setIntraPbx({
                    seatId: localStorage.getItem('subscriberId'),
                    intraPbx: this.clirIntrapbx,
                    message: msg
                });
            },
            requestInProgress(loading){
                this.isLoading = loading;
            }
        }
    }
</script>

<style lang="stylus" rel="stylesheet/stylus">
    @import '../../../themes/quasar.variables';
    .csc-pbx-settings-toggle
        margin-top 18px
    .csc-pbx-settings-spinner
        margin-left 10px
        padding-top 18px
</style>
