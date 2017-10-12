<template>
    <page title="Privacy">
        <q-toggle :label="((!callBlockingEnabled) ? 'Enable' : 'Disable') + ' Hide My Number'"
                @input="toggle()" v-model="callBlockingEnabled"/>
    </page>
</template>

<script>
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
                    showToast('Hide my number ' + ((this.callBlockingEnabled) ? 'enabled' : 'disabled'));
                }).catch((err)=>{
                    console.log(err);
                });
            }
        }
    }
</script>

<style>
</style>
