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
                <csc-change-password
                    :loading="isPasswordChanging"
                    :error="changePasswordError"
                    :subscriber="getSubscriber"
                    @change="changePassword"
                />
            </div>
        </div>
    </csc-page>
</template>

<script>
    import {
        showGlobalError,
        showToast
    } from '../../helpers/ui'
    import {
        RequestState
    } from "../../store/common"
    import {
        mapState,
        mapGetters,
        mapActions
    } from 'vuex'
    import CscPage from '../CscPage'
    import CscChangePassword from "./UserSettings/CscChangePassword";
    export default {
        name: 'csc-page-user-settings',
        data () {
            return {
            }
        },
        components: {
            CscChangePassword,
            CscPage
        },
        mounted() {
        },
        computed: {
            ...mapState('user', [
                'changePasswordState',
                'changePasswordError'
            ]),
            ...mapGetters('user', [
                'getSubscriber',
                'isPasswordChanging'
            ])
        },
        methods: {
            ...mapActions('user', [
                'changePassword'
            ])
        },
        watch: {
            changePasswordState(state) {
                if(state === RequestState.succeeded) {
                    showToast(this.$t('changePasswordToast'));
                }
                else if(state === RequestState.failed) {
                    showGlobalError(this.changePasswordError);
                }
            }
        }
    }
</script>

<style lang="stylus" rel="stylesheet/stylus">
    @import '../../themes/quasar.variables';
</style>
