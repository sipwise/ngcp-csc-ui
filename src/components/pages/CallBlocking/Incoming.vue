<template>
    <page title="Incoming Calls">
        <q-toggle :label="((!callBlockingEnabled)?'Enable':'Disable') + ' Call Blocking'"
                  @input="toggleIncoming()" v-model="callBlockingEnabled"/>
    </page>
</template>

<script>
    import { startLoading, stopLoading, showGlobalError } from '../../../helpers/ui'
    import Page  from '../../Page'
    import { QField, QToggle, Toast } from 'quasar-framework'
    export default {
        data () {
            return {
                callBlockingEnabled: false
            }
        },
        mounted() {
            this.$store.dispatch('callBlocking/loadIncoming').then(()=>{
                this.callBlockingEnabled = this.$store.state.callBlocking.incomingEnabled;
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
            toggleIncoming () {
                this.$store.dispatch('callBlocking/toggleIncoming', this.callBlockingEnabled).then(()=>{
                    Toast.create({
                        html: 'Call blocking for incoming calls ' + ((this.callBlockingEnabled)?'enabled':'disabled'),
                        color: 'white',
                        bgColor: '#68A44E'
                    });
                }).catch((err)=>{
                    console.log(err);
                });
            }
        }
    }
</script>

<style>
</style>
