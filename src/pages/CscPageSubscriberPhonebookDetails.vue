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
import { mapWaitingActions } from 'vue-wait'
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
        await this.getPhonebook(this.id)
    },
    methods: {
        ...mapWaitingActions('user', {
            getPhonebookDetails: 'getPhonebookDetails',
            getValueShared: 'getValueShared',
            getValueName: 'getValueName',
            getValueNumber: 'getValueNumber'
        }),
        async getPhonebook (id) {
            const response = await this.getPhonebookDetails(id)
            this.name = response.data.name
            this.number = response.data.number
            this.shared = response.data.shared
        },
        cancel () {
            this.$router.push('/user/subscriber-phonebook/')
            this.$emit('cancel')
        },
        async changeValueName () {
            await this.getValueName({
                phonebookId: this.id,
                name: this.name
            })
        },
        changeValueShared () {
            this.getValueShared({
                phonebookId: this.id,
                shared: this.shared
            })
        },
        changeValueNumber () {
            this.getValueNumber({
                phonebookId: this.id,
                number: this.number
            })
        },
        async confirm () {
            await this.changeValueName()
            await this.changeValueShared()
            await this.changeValueNumber()
            await this.$router.push('/user/subscriber-phonebook/')
        }
    }
}
</script>
