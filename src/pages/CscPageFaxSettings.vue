<template>
    <csc-page-sticky-tabs
        :value="selectedTab"
        class="q-pa-lg"
    >
        <template
            #tabs
        >
            <q-tab
                name="fax2mail"
                icon="perm_phone_msg"
                :label="$t('Fax to mail and sendfax')"
                @click="selectTab('fax2mail')"
            />
            <q-tab
                name="mail2fax"
                icon="forward_to_inbox"
                :label="$t('Mail to Fax')"
                @click="selectTab('mail2fax')"
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
    },
    methods: {
        selectTab (tabName) {
            if (this.selectedTab !== tabName) {
                this.selectedTab = tabName
            }
        }
    }
}
</script>
