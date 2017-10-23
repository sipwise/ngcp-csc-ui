<template>
    <page :title="$t('pages.conversations.title')">
	<q-card v-for="conversation in conversations" :key="conversation.caller"
        class="conversation-card">
		<q-collapsible :label="getCollapsibleLabel(conversation)"
            :sublabel="getDateLabel(conversation.start_time)" disable="true">
		</q-collapsible>
		<q-card-separator />
	    <q-card-actions align="center">
            <q-btn v-if="hasCallOption(conversation.call_type)" flat round
                small class="call-btn"><q-icon name="call" /></q-btn>
	    </q-card-actions>
	</q-card>
    </page>
</template>

<script>
    import Page from '../Page'
    import moment from 'moment'
    import { QBtn, QCardActions, QCard, QCollapsible, QCardSeparator,
        QIcon } from 'quasar-framework'
    export default {
        data () {
            return {
                conversations: []
            }
        },
        mounted() {
            this.$store.dispatch('conversations/loadConversations').then(() => {
                this.conversations = this.$store.state.conversations
                    .conversations;
            }).catch((err) => {
                console.log(err);
            });
        },
        components: {
            Page,
    	    QBtn,
            QCard,
	        QCardActions,
            QCardSeparator,
            QCollapsible,
	        QIcon
        },
        methods: {
            hasCallOption(call_type) {
                return (['call forward', 'call', 'voicemail', 'sms']
                    .indexOf(call_type) > -1);
            },
			getCollapsibleLabel(item) {
				item.call_type = (['cfu', 'cfna', 'cfb', 'cfna']
                    .indexOf(item.call_type) > -1) ? 'call forward'
                    : item.call_type;
				let prefix = item.status == 'ok' ? 'Successful '
                    : 'Unsuccessful ';
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
        .call-btn
            margin-top 10px
</style>
