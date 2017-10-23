<template>
    <page :title="$t('pages.conversations.title')">
	<q-card v-for="conversation in conversations" :key="conversation.caller" class="conversation-card">
		<q-collapsible icon="call" :label="getCollapsibleLabel(conversation)" :sublabel="getDateLabel(conversation.start_time)">
 		  <div>
            <ul>
                <li v-if="hasMessage(conversation.call_type)"><strong>{{ $t('pages.conversations.card.message') }}:</strong> {{ conversation.context }}</li>
                <li><strong>{{ $t('pages.conversations.card.date') }}:</strong> {{ conversation.start_time }}</li>
                <li v-if="hasDuration(conversation.call_type)"><strong>{{ $t('pages.conversations.card.duration') }}:</strong> {{ conversation.duration }}</li>
                <!--<li v-if="hasCost(conversation.call_type)"><strong>{{ $t('pages.conversations.card.cost') }}:</strong> {{ conversation.cost }}</li>-->
                <li v-if="hasFolder(conversation.call_type)"><strong>{{ $t('pages.conversations.card.folder') }}:</strong> {{ conversation.folder }}</li>
                <li v-if="hasPages(conversation.call_type)"><strong>{{ $t('pages.conversations.card.pages') }}:</strong> {{ conversation.pages }}</li>
            </ul>
		  </div>
		</q-collapsible>
		<q-card-separator />
	    <q-card-actions align="center">
            <q-btn v-if="hasFaxOption(conversation.call_type)" flat round small><q-icon name="insert_drive_file" /></q-btn>
            <q-btn v-if="hasDownloadOption(conversation.call_type)" flat round small><q-icon name="file_download" /></q-btn>
            <q-btn v-if="hasPlayOption(conversation.call_type)" flat round small><q-icon name="play_arrow" /></q-btn>
            <q-btn v-if="hasSmsOption(conversation.call_type)" flat round small><q-icon name="mail_outline" /></q-btn>
            <q-btn v-if="hasCallOption(conversation.call_type)" flat round small><q-icon name="call" /></q-btn>
	    </q-card-actions>
	</q-card>
    </page>
</template>

<script>

    // TODO: 1. Implement custom q-card-collapsible that has two icon attributes
    // TODO: 2. Create events and actions for buttons where applicable
    // TODO: 3. Styling in general

    import Page from '../Page'
    import moment from 'moment'
    import { QBtn, QCardActions, QCard, QCardTitle, QCardMain, QCardSeparator,
		QCollapsible, QIcon } from 'quasar-framework'
    export default {
        data () {
            return {
                conversations: []
            }
        },
        mounted() {
            this.$store.dispatch('conversations/loadConversations').then(() => {
                this.conversations = this.$store.state.conversations.conversations;
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
			QCollapsible,
	        QIcon
        },
        methods: {
            hasCallOption(call_type) {
                return (['call forward', 'call', 'voicemail', 'sms'].indexOf(call_type) > -1);
            },
            hasSmsOption(call_type) {
                return (['call forward', 'call', 'sms'].indexOf(call_type) > -1);
            },
            hasFaxOption(call_type) {
                return call_type == 'fax';
            },
            hasDownloadOption(call_type) {
                return (['fax', 'voicemail'].indexOf(call_type) > -1);
            },
            hasPlayOption(call_type) {
                return call_type == 'voicemail';
            },
			hasDuration(call_type) {
                return (['call forward', 'call', 'voicemail', 'fax'].indexOf(call_type) > -1);
			},
			hasCost(call_type) {
                return (['call forward', 'call', 'sms'].indexOf(call_type) > -1);
			},
			hasMessage(call_type) {
                return (['xmpp', 'sms'].indexOf(call_type) > -1);
			},
			hasFolder(call_type) {
                return call_type == 'voicemail';
			},
			hasPages(call_type) {
                return call_type == 'fax';
			},
			getCollapsibleLabel(item) {
				// TODO Do this value "call forward" state change somewhere else,
				// for example in src/store/conversations.js
				if (['cfu', 'cfna', 'cfb', 'cfna'].indexOf(item.call_type) > -1) {
					item.call_type = 'call forward';
				}
				let prefix = item.status == 'ok' ? 'Successful ' : 'Unsuccessful ';
				let direction = item.direction == 'in' ? ' from ' : ' to ';
				let source = direction == 'from' ? item.caller : item.callee;
				return prefix + item.call_type + direction + item.caller;
			},
            getDateLabel(time) {
                return moment(time).format('MMMM D, YYYY [at] h:mm a');
            }
        }
    }
</script>

<style lang="stylus">
    .conversation-card
        padding: 15px
        ul
            list-style-type: none
</style>
