<template>
    <page :title="$t('pages.conversations.title')">
    <q-card v-for="conversation in conversations" :key="conversation.caller"
        class="conversation-card">
        <q-collapsible :icon="getCollapsibleIcons(conversation)" :label="getCollapsibleLabel(conversation)"
            :sublabel="getDateLabel(conversation.start_time)" disable="true">Test
        </q-collapsible>
        <q-card-separator />
        <q-card-actions align="center">
            <q-btn v-if="hasCallOption(conversation.type)" flat round
                small class="call-btn"><q-icon name="call" /></q-btn>
        </q-card-actions>
    </q-card>
    </page>
</template>

<script>
    import Page from '../Page'
    import { date } from 'quasar'
    const { formatDate } = date
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
                this.conversations = this.$store.state.conversations.
                    conversations;
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
            hasCallOption(type) {
                return (['call', 'call forward', 'sms', 'voicemail']
                    .indexOf(type) > -1);
            },
            getCollapsibleIcons(item) {
                let directionIcon = item.direction == 'out' ? 'call_made' : 'call_received';
                switch (item.type) {
                    case 'call':
                        return 'phone ' + directionIcon;
                        break;
                    case 'call forward':
                        return 'call_merge ' + directionIcon;
                        break;
                    case 'voicemail':
                        return 'voicemail ' + directionIcon;
                        break;
                    case 'fax':
                        return 'insert_drive_file ' + directionIcon;
                        break;
                    case 'sms':
                        return 'txtsms ' + directionIcon;
                        break;
                };
            },
            getCollapsibleLabel(item) {
                let prefix = item.status == 'ok' ? 'Successful '
                    : 'Unsuccessful ';
                let direction = item.direction == 'in' ? ' from ' : ' to ';
                return prefix + item.type + direction + item.caller;
            },
            getDateLabel(time) {
                var timeStamp = new Date(time);
                return formatDate(timeStamp, 'MMMM D, YYYY') + ' at ' + formatDate(timeStamp, 'h:mm a');
            }
        }
    }
</script>

<style lang="stylus">
    .conversation-card
        padding: 15px
        .call-btn
            margin-bottom -10px
        .q-item-icon
            padding-right 12px
</style>
