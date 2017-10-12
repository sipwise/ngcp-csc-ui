<template>
    <page title="Privacy">
        <q-toggle :label="(!callBlockingEnabled ? 'Hide' : 'Show') + ' Own Number'"
                @input="toggle()" v-model="callBlockingEnabled"/>
    </page>
</template>

<script>
    import { showToast } from '../../../helpers/ui'
    import Page  from '../../Page'
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
            Page,
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

<style>
</style>
