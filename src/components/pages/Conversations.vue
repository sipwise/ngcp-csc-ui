<template>
    <page title="Conversations">
        <p>{{ conversationsList }}</p>
    </page>
</template>

<script>
    import Page from '../Page'
    export default {
        data () {
            return {
                conversationsList: []
            }
        },
        mounted() {
            this.$store.dispatch('conversations/loadConversations').then(() => {
                this.conversationsList = this.$store.state.conversations.conversationsList;
            }).catch((err) => {
               console.log(err);
            });
        },
        components: {
            Page
        }
    }
</script>

<style>
</style>
