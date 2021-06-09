<template>
    <csc-page-sticky-tabs
        v-model="selectedTab"
        class="q-pa-lg"
    >
        <template
            v-slot:tabs
        >
            <q-tab
                name="fax2mail"
                icon="perm_phone_msg"
                :label="$t('Fax to Mail and Sendfax')"
            />
            <q-tab
                name="mail2fax"
                icon="forward_to_inbox"
                :label="$t('Mail to Fax')"
            />
        </template>

        <csc-fax-to-mail-settings
            v-if="selectedTab === 'fax2mail'"
        />
        <csc-mail-to-fax-settings
            v-if="selectedTab === 'mail2fax'"
        />
    </csc-page-sticky-tabs>
</template>

<script>
import CscPageStickyTabs from 'components/CscPageStickyTabs'
import CscFaxToMailSettings from 'components/pages/FaxSettings/CscFaxToMailSettings'
import CscMailToFaxSettings from 'components/pages/FaxSettings/CscMailToFaxSettings'

export default {
    name: 'CscPageFaxSettings',
    components: {
        CscPageStickyTabs,
        CscMailToFaxSettings,
        CscFaxToMailSettings
    },
    data () {
        return {
            selectedTab: 'fax2mail'
        }
    }
}
</script>
