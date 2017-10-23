<template>
    <page :title="$t('pages.conversations.title')">
    <q-card v-for="conversation in conversations" :key="conversation.caller"
        class="conversation-card">
        <q-collapsible :icon="getCollapsibleIcon(conversation)" :label="getCollapsibleLabel(conversation)"
            :sublabel="getDateLabel(conversation.start_time)" disable="true">
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
                return (['call', 'voicemail', 'sms']
                    .indexOf(type) > -1);
            },
            getCollapsibleIcon(item) {
                switch (item.type) {
                    case 'call':
                        return 'phone';
                        break;
                    case 'call forward':
                        return 'call_merge';
                        break;
                    case 'voicemail':
                        return 'voicemail';
                        break;
                    case 'fax':
                        return 'insert_drive_file';
                        break;
                    case 'sms':
                        return 'txtsms';
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
                return moment(time).format('MMMM D, YYYY [at] h:mm a');
            }
        }
    }
</script>

<style lang="stylus">
    .conversation-card
        padding: 15px
        .call-btn
            margin-bottom -10px
</style>
