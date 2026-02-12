<template>
    <csc-page-sticky
        id="csc-page-subscriber-phonebook-details"
        ref="pageSticky"
    >
        <template
            #header
        >
            <q-breadcrumbs
                class="absolute-left q-ml-md text-weight-light"
                active-color="primary"
                separator-color="primary"
            >
                <q-breadcrumbs-el
                    class="cursor-pointer"
                    to="/user/subscriber-phonebook"
                    :label="$t('Subscriber Phonebook')"
                    icon="fas fa-user"
                />
                <q-breadcrumbs-el
                    :label="name"
                />
            </q-breadcrumbs>
        </template>
        <q-item
            class="col col-xs-12"
        >
            <q-list
                class="col col-xs-12"
                side
                top
                no-wrap
            >
                <q-input
                    v-model="name"
                    :label="$t('Name')"
                    data-cy="csc-phonebook-details-name"
                />

                <q-input
                    v-model="number"
                    :required="true"
                    :label="$t('Number')"
                    data-cy="csc-phonebook-details-number"
                />

                <q-toggle
                    v-model="shared"
                    :label="$t('Shared')"
                    data-cy="csc-phonebook-details-shared"
                />
            </q-list>
        </q-item>
        <div class="text-center">
            <q-btn
                icon="clear"
                color="white"
                flat
                :label="$t('Cancel')"
                data-cy="csc-phonebook-details-cancel"
                @click="cancel"
            />
            <q-btn
                icon="check"
                :label="$t('Confirm')"
                data-cy="csc-phonebook-details-confirm"
                unelevated
                text-color="primary"
                @click="confirm"
            />
        </div>
    </csc-page-sticky>
</template>

<script>
import CscPageSticky from 'components/CscPageSticky'
import { mapWaitingActions } from 'vue-wait-vue3'
import { mapGetters } from 'vuex'
export default {
    name: 'CscPageSubscriberPhonebookDetails',
    components: {
        CscPageSticky
    },
    emits: ['cancel'],
    data () {
        return {
            id: this.$route.params.id,
            name: '',
            number: '',
            shared: false
        }
    },
    async mounted () {
        const response = await this.getEntry({
            id: this.id,
            subscriberId: this.getSubscriberId
        })
        this.name = response.name
        this.number = response.number
        this.shared = response.shared
    },
    computed: {
        ...mapGetters('user', [
            'getSubscriberId'
        ])
    },
    methods: {
        ...mapWaitingActions('subscriber-phonebook', {
            getEntry: 'getEntry',
            updateEntry: 'updateEntry'
        }),
        cancel () {
            this.$router.push('/user/subscriber-phonebook/')
            this.$emit('cancel')
        },
        async confirm () {
            await this.updateEntry({
                subscriberId: this.getSubscriberId,
                id: this.id,
                number: this.number,
                shared: this.shared,
                name: this.name
            })
            this.$router.push('/user/subscriber-phonebook/')
        }
    }
}
</script>
