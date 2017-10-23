<template>
    <page :title="$t('pages.conversations.title')">
	<q-card v-for="conversation in conversationsList" :key="conversation.caller" class="conversation-card">
        <q-card-title>
            <p><q-icon name="call" /> <q-icon name="keyboard_arrow_right" /> Successful call from {{ conversation.caller }}</p>
        </q-card-title>
        <q-card-separator />
        <q-card-main>
            <ul>
                <li><strong>{{ $t('pages.conversations.card.date') }}:</strong> {{ conversation.start_time }}</li>
                <li><strong>{{ $t('pages.conversations.card.duration') }}:</strong> {{ conversation.duration }}</li>
            </ul>
        </q-card-main>
	    <q-card-actions align="center">
            <q-btn flat round small><q-icon name="mail_outline" /></q-btn>
            <q-btn flat round small><q-icon name="call" /></q-btn>
	    </q-card-actions>
	</q-card>
    </page>
</template>

<script>
    import Page from '../Page'
    import { QCardActions, QBtn, QCard, QCardTitle, QCardMain, QCardSeparator,
	QIcon } from 'quasar-framework'
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
            Page,
    	    QBtn,
            QCard,
	        QCardActions,
            QCardMain,
            QCardTitle,
            QCardSeparator,
	        QIcon
        }
    }
</script>

<style lang="stylus">
    .conversation-card
        padding: 15px
        ul
            list-style-type: none
</style>
