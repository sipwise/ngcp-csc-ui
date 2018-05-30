<template>
    <csc-page title="Privacy" class="csc-simple-page">
        <q-toggle :label="(!callBlockingEnabled ? 'Hide' : 'Show') + ' Own Number'"
                @input="toggle()" v-model="callBlockingEnabled"/>
    </csc-page>
</template>

<script>
    import { showToast } from '../../../helpers/ui'
    import CscPage  from '../../CscPage'
    import { QField, QToggle, Toast } from 'quasar-framework'
    export default {
        data () {
            return {
                callBlockingEnabled: false
            }
        },
        mounted() {
            this.$store.dispatch('callBlocking/loadPrivacy').then(()=>{
                this.callBlockingEnabled = this.$store.state.callBlocking.privacyEnabled;
            }).catch((err)=>{
                console.log(err);
            });
        },
        components: {
            CscPage,
            QToggle,
            Toast,
            QField
        },
        methods: {
            toggle () {
                this.$store.dispatch('callBlocking/togglePrivacy', this.callBlockingEnabled).then(()=>{
                    showToast('Own number will now be ' + (this.callBlockingEnabled ? 'hidden' : 'shown') +
                    ' on outbound calls');
                }).catch((err)=>{
                    console.log(err);
                });
            }
        }
    }
</script>

<style lang="stylus" rel="stylesheet/stylus">
</style>
