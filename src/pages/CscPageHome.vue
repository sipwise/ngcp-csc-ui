<template>
    <csc-page
        id="csc-page-home"
        class="full-width row wrap justify-center items-start content-center"
    >
        <div
            class="col-xs-10 col-sm-8 col-md-4 csc-opt-center"
        >
            <csc-inline-alert-info
                v-if="!isCallInitializing && !hasRtcEngineCapabilityEnabled"
                class="q-mb-lg"
            >
                {{ $t('You can neither make a call nor receive one, since the RTC:engine is not active. If you operate a C5 CE then first upgrade to a C5 PRO to be able to use the RTC:engine.') }}
            </csc-inline-alert-info>
            <csc-input
                id="csc-call-number-input"
                :label="$t('Enter a number to dial')"
                :value="callNumberInput"
                :readonly="dialpadOpened"
                :disable="!isCallEnabled"
                :loading="isCallInitializing"
                clearable
                @keypress.space.prevent
                @keydown.space.prevent
                @keyup.space.prevent
                @input="numberInputChanged"
            >
                <template
                    v-slot:prepend
                >
                    <q-icon
                        name="contact_phone"
                        size="24px"
                    />
                </template>
            </csc-input>
            <csc-call-dialpad
                v-if="dialpadOpened && isCallEnabled"
                :show-backspace-button="true"
                :show-clear-button="true"
                @click="dialpadClick"
                @remove="remove"
                @remove-all="removeAll"
            />
        </div>
    </csc-page>
</template>

<script>
import platformMixin from 'src/mixins/platform'
import {
    mapGetters
} from 'vuex'
import CscCallDialpad from 'components/CscCallDialpad'
import CscPage from 'components/CscPage'
import CscInlineAlertInfo from 'components/CscInlineAlertInfo'
import CscInput from 'components/form/CscInput'

export default {
    components: {
        CscInput,
        CscInlineAlertInfo,
        CscPage,
        CscCallDialpad
    },
    mixins: [
        platformMixin
    ],
    props: [
    ],
    data () {
        return {
        }
    },
    computed: {
        ...mapGetters('call', [
            'callState',
            'callNumberInput',
            'hasRtcEngineCapabilityEnabled',
            'desktopSharingInstall',
            'isCallEnabled',
            'isCallInitializing'
        ]),
        dialpadOpened () {
            return this.callState === 'input' &&
                !this.isCallInitializing &&
                this.isMobile &&
                this.hasRtcEngineCapabilityEnabled
        },
        pageClasses () {
            const classes = ['row', 'justify-center']
            if (this.isMobile) {
                classes.push('items-end')
                classes.push('csc-call-page-mobile')
            } else {
                classes.push('items-center')
                classes.push('csc-call-page-mobile')
            }
            return classes
        }
    },
    methods: {
        numberInputChanged (number) {
            this.$store.commit('call/numberInputChanged', number)
        },
        dialpadClick (value) {
            const number = this.callNumberInput + value
            this.$store.commit('call/numberInputChanged', number)
        },
        remove () {
            const number = this.callNumberInput.slice(0, -1)
            this.$store.commit('call/numberInputChanged', number)
        },
        removeAll () {
            this.$store.commit('call/numberInputChanged', '')
        }
    }
}
</script>
