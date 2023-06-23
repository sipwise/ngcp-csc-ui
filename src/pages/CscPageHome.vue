<template>
    <csc-page
        id="csc-page-home"
        class="full-width row wrap justify-center items-start content-center"
    >
        <div
            class="col-xs-10 col-sm-8 col-md-4 csc-opt-center"
        >
            <csc-inline-alert-alert
                v-if="connectionError"
                class="q-mb-md"
            >
                {{ connectionError }}
            </csc-inline-alert-alert>
            <csc-input
                id="csc-call-number-input"
                :label="$t('Enter a number to dial')"
                data-cy="csc-call-number-input"
                :value="callNumberInput || $route.query.number"
                :readonly="dialpadOpened"
                clearable
                :disable="!isCallEnabled"
                @keypress.space.prevent
                @keydown.space.prevent
                @keyup.space.prevent
                @input="numberInputChanged"
                @keyup.enter="startCall"
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
import CscInput from 'components/form/CscInput'
import CscInlineAlertAlert from 'components/CscInlineAlertAlert'

export default {
    name: 'CscPageHome',
    meta () {
        return {
            title: this.pageTitle
        }
    },
    components: {
        CscInlineAlertAlert,
        CscInput,
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
            'isCallEnabled',
            'callStateTitle',
            'callStateSubtitle',
            'connectionError'
        ]),
        dialpadOpened () {
            return this.callState === 'input' && this.isMobile
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
        },
        pageTitle () {
            let title = this.callStateTitle
            if (this.callStateSubtitle !== '') {
                title += ' (' + this.callStateSubtitle + ')'
            }
            return title
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
        },
        startCall () {
            if (this.callNumberInput && this.callNumberInput !== '') {
                this.$store.dispatch('call/start', 'audioOnly')
            }
        }
    }
}
</script>
