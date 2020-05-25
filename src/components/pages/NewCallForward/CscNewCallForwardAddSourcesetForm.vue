<template>
    <div
        v-if="enabled"
        class="csc-form"
    >
        <csc-new-call-forward-input-text
            :label="$t('pages.newCallForward.sourcesetName')"
            v-model="name"
            @submit="save"
            @error="errorName"
        />

        <csc-new-call-forward-input
            :label="$t('callBlocking.number')"
            v-model="number"
            @submit="save"
            @error="errorNumber"
        />

        <div
            class="csc-form-actions row justify-center"
        >
            <q-btn
                flat
                color="default"
                icon="clear"
                @mousedown.native="cancel()"
            >
                {{ $t('buttons.cancel') }}
            </q-btn>
            <q-btn
                v-if="!loading"
                flat
                color="primary"
                icon="done"
                @click="save(); close()"
                :disable="saveDisabled"
            >
                {{ $t('buttons.save') }}
            </q-btn>
            <div
                v-if="loading"
                class="csc-form-actions-spinner"
            >
                <csc-spinner />
            </div>
        </div>
    </div>
</template>

<script>
    import {
        mapGetters,
    } from 'vuex'
    import CscNewCallForwardInput from './CscNewCallForwardInput'
    import CscNewCallForwardInputText from './CscNewCallForwardInputText'
    import CscSpinner from '../../CscSpinner'
    import {
        showGlobalError
    } from '../../../helpers/ui'
    import {
        maxLength
    } from 'vuelidate/lib/validators'
    import {
        QField,
        QInput,
        QBtn
    } from 'quasar-framework'

    export default {
        name: 'csc-new-call-forward-add-sourceset-form',
        components: {
            CscNewCallForwardInput,
            CscNewCallForwardInputText,
            CscSpinner,
            QField,
            QInput,
            QBtn
        },
        data () {
            return {
                loading: false,
                enabled: false,
                number: '',
                name: '',
                nameError: false,
                numberError: false,
                destinationIndex: null
            }
        },
        props: [
            'groupName',
            'groupId'
        ],
        validations: {
            number: {
                minLength: 1,
                maxLength: maxLength(64)
            },
            name: {
                minLength: 1
            }
        },
        computed: {
            ...mapGetters('newCallForward', [
                'destinationInCreation'
            ]),
            saveDisabled() {
                return this.number.length < 1 || this.name.length < 1 || this.numberError|| this.nameError || this.disable || this.loading;
            }
        },
        methods: {
            async save() {
                let sourceSetId;
                const forwardGroupId = this.groupId;
                const forwardGroupName = this.groupName;

                if (this.numberError || this.nameError || this.saveDisabled) {
                    showGlobalError(this.$t('validationErrors.generic'));
                    return;
                }
                try{
                    await this.$store.dispatch('newCallForward/addGroupLoader', forwardGroupId);
                    sourceSetId = await this.$store.dispatch('newCallForward/createSourceSet', {
                        name: this.name,
                        source: this.number
                    });
                    await this.$store.dispatch('newCallForward/addSourcesetToGroup', {
                        name:   forwardGroupName,
                        id: forwardGroupId,
                        sourceSetId: sourceSetId
                    });
                    await this.$store.dispatch('newCallForward/removeGroupLoader', forwardGroupId);
                    await this.$store.dispatch('newCallForward/loadForwardGroups');
                    await this.$store.dispatch('newCallForward/loadSourcesets');
                }
                catch(err){
                    console.log(err)
                }
            },
            cancel() {
                this.number = '';
                this.name = '';
                this.enabled = false;
            },
            add() {
                this.number = '';
                this.name = '';
                this.enabled = true;
            },
            close() {
                this.enabled = false;
            },
            reset() {
                this.cancel();
            },
            errorName(state) {
                this.nameError = state;
            },
            errorNumber(state) {
                this.numberError = state;
            }
        }
    }
</script>

<style lang="stylus" rel="stylesheet/stylus">
    @import '../../../themes/app.common.styl'
</style>
